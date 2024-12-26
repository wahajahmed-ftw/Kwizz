from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import random,string
from random import choices
from flask_socketio import SocketIO, join_room, leave_room, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super secret key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
app.config['SESSION_TYPE'] = 'filesystem'  # Ensure sessions are stored
db = SQLAlchemy(app)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

# Models (unchanged)
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    owner_id = db.Column(db.Integer, nullable=False)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    options = db.Column(db.JSON, nullable=False)  # Stores the options in JSON format
    correct_option = db.Column(db.String(1), nullable=False)  # Stores 'A', 'B', 'C', or 'D'

    # Ensure that the correct option is one of 'A', 'B', 'C', or 'D'
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.correct_option not in ['A', 'B', 'C', 'D']:
            raise ValueError("correct_option must be one of 'A', 'B', 'C', or 'D'")

class UserInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    password = db.Column(db.String(100))
    email = db.Column(db.String(100))


@app.route("/signup", methods=["POST"])
def signup():
    name=request.json['name']
    password=request.json['password']
    email=request.json['email']
    print(name,email,password)
    if UserInfo.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 409
    # Save new user to the database
    try:
        new_user = UserInfo(name=name, password=password, email=email)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

# Login endpoint (sets session)
@app.route("/login", methods=["POST"])
def login():
    email = request.json.get("email")
    password = request.json.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400

    user = UserInfo.query.filter_by(email=email).first()

    if not user or user.password != password:
        return jsonify({"message": "Invalid email or password!"}), 401

    # Set session
    session['user_id'] = user.id
    session['user_name'] = user.name

    return jsonify({"message": "Login successful!", "name": user.name}), 200

# Logout endpoint (clears session)
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully!"}), 200

# Create quiz endpoint
@app.route("/create-quiz", methods=["POST"])
def create_quiz():
    session_name= session['user_name']
    if session_name is None:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    title = data.get("title")
    questions = data.get("questions")

    if not title or not questions:
        return jsonify({"message": "Title and questions are required"}), 400

    try:
        # Create the quiz
        new_quiz = Quiz(title=title, owner_id=session['user_id'])
        db.session.add(new_quiz)
        db.session.commit()

        # Add questions
        for question in questions:
            new_question = Question(
                quiz_id=new_quiz.id,
                text=question['text'],
                options=question['options'],
                correct_option=question['correctOption']
            )
            db.session.add(new_question)

        db.session.commit()
        return jsonify({"message": "Quiz created successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

@app.route('/get-quizzes', methods=['GET'])
def get_quizzes():
    try:
        # Verify user authentication (ensure `session['user_id']` is set)
        user_id = session.get('user_id')  # Assuming `user_id` is stored in the session
        if not user_id:
            return jsonify({"message": "Unauthorized. Please log in."}), 401

        # Pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
        offset = (page - 1) * limit

        # Fetch quizzes created by the logged-in user
        total_quizzes = Quiz.query.filter_by(owner_id=user_id).count()
        quizzes = Quiz.query.filter_by(owner_id=user_id).offset(offset).limit(limit).all()

        # Structure response data
        quizzes_data = []
        for quiz in quizzes:
            questions = Question.query.filter_by(quiz_id=quiz.id).all()
            questions_data = [
                {
                    "id": question.id,
                    "text": question.text,
                    "options": question.options,
                    "correct_option": question.correct_option
                }
                for question in questions
            ]

            quizzes_data.append({
                "id": quiz.id,
                "title": quiz.title,
                "created_at": quiz.id,  # Assuming `id` as a substitute for a created date
                "questions": questions_data
            })

        return jsonify({
            "quizzes": quizzes_data,
            "totalPages": (total_quizzes + limit - 1) // limit  # Calculate total pages
        }), 200

    except Exception as e:
        print("Error:", e)  # Log for debugging
        return jsonify({"message": "Error fetching quizzes", "error": str(e)}), 500

@app.route('/quiz/<int:quiz_id>', methods=['GET'])
def view_quiz(quiz_id):
    try:
        user_id = session.get('user_id')  # Ensure user is logged in
        if not user_id:
            return jsonify({"message": "Unauthorized"}), 401

        quiz = Quiz.query.filter_by(id=quiz_id, owner_id=user_id).first()
        if not quiz:
            return jsonify({"message": "Quiz not found or unauthorized access"}), 404

        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        quiz_data = {
            "id": quiz.id,
            "title": quiz.title,
            "created_at": quiz.created_at if hasattr(quiz, "created_at") else "Unknown",
            "questions": [
                {
                    "id": question.id,
                    "text": question.text,
                    "options": question.options,
                    "correct_option": question.correct_option
                }
                for question in questions
            ]
        }

        return jsonify(quiz_data), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Error fetching quiz", "error": str(e)}), 500


@app.route('/delete-quiz/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    try:
        user_id = session.get('user_id')  # Ensure user is logged in
        if not user_id:
            return jsonify({"message": "Unauthorized"}), 401

        # Fetch the quiz with the given quiz_id and check if the user is the owner
        quiz = Quiz.query.filter_by(id=quiz_id, owner_id=user_id).first()
        if not quiz:
            return jsonify({"message": "Quiz not found or unauthorized access"}), 404

        # Delete associated questions first
        Question.query.filter_by(quiz_id=quiz_id).delete()  # Remove questions related to the quiz

        # Delete the quiz itself
        db.session.delete(quiz)
        db.session.commit()

        return jsonify({"message": "Quiz and associated questions deleted successfully"}), 200
    except Exception as e:
        print("Error:", e)
        db.session.rollback()  # Rollback if there is an error
        return jsonify({"message": "Error deleting quiz", "error": str(e)}), 500








############################################
def get_session():
    # Using app context here to ensure that SQLAlchemy can access the database engine
    with app.app_context():
        from sqlalchemy.orm import sessionmaker
        Session = sessionmaker(bind=db.engine)
        return Session()


active_games = {}

def generate_game_pin():
    """Generate a unique 6-digit game PIN."""
    return ''.join(random.choices(string.digits, k=6))

@socketio.on('host_quiz')
def host_quiz(data):
    quiz_id = data.get('quizId')
    if not quiz_id:
        emit('error', {'message': 'Quiz ID is required'}, to=request.sid)
        return

    # Generate a unique game PIN
    game_pin = generate_game_pin()
    while game_pin in active_games:
        game_pin = generate_game_pin()  # Ensure the game PIN is unique

    # Fetch the quiz and questions from the database
    session = get_session()  # Assuming you have a session handling function
    quiz = session.get(Quiz, quiz_id)
    if not quiz:
        emit('error', {'message': 'Quiz not found'}, to=request.sid)
        return

    questions = session.query(Question).filter_by(quiz_id=quiz_id).all()
    if not questions:
        emit('error', {'message': 'No questions found for this quiz'}, to=request.sid)
        return

    # Store game details in memory
    active_games[game_pin] = {
        'quiz_id': quiz_id,
        'host_sid': request.sid,
        'players': [],
        'questions': [
            {
                'id': question.id,
                'text': question.text,
                'options': question.options,
                'correct_option': question.correct_option
            }
            for question in questions
        ],
        'current_question_index': -1,
        'answers': {},
        'scores': {}  
    }

    # Add the host to the game room
    join_room(game_pin)

    # Send the game PIN and quiz title back to the host
    emit('host_quiz', {'gamePin': game_pin, 'quizTitle': quiz.title}, to=request.sid)

@socketio.on('join_game')
def join_game(data):
    print(f"Processing join_game from client: {request.sid}")
    game_pin = data.get('gamePin')
    player_name = data.get('name')

    print(f"Received gamePin: {game_pin}, playerName: {player_name}")

    if not game_pin or not player_name:
        # Send error response
        emit('join_game_response', {'error': 'Game PIN and player name are required'}, to=request.sid)
        return

    game = active_games.get(game_pin)
    if not game:
        # Send error response
        emit('join_game_response', {'error': 'Invalid Game PIN'}, to=request.sid)
        return

    # Add the player to the game
    player = {'name': player_name, 'sid': request.sid}
    game['players'].append(player)
    join_room(game_pin)

    # Notify host about the new player
    emit('player_joined', {'name': player_name}, to=game['host_sid'])

    # Send success response back to the client
    emit('join_game_response', {'message': f'{player_name} joined the game', 'gamePin': game_pin}, to=request.sid)


@socketio.on('start_quiz')
def start_quiz(data):
    game_pin = data.get('gamePin')
    if not game_pin:
        emit('error', {'message': 'Game PIN is required'}, to=request.sid)
        return

    game = active_games.get(game_pin)
    if not game:
        emit('error', {'message': 'Invalid Game PIN'}, to=request.sid)
        return

    # Start the quiz by sending the first question
    game['current_question_index'] = 0
    question = game['questions'][game['current_question_index']]
    emit('new_question', question, to=game_pin)

@socketio.on('next_question')
def next_question(data):
    game_pin = data.get('gamePin')
    if not game_pin:
        emit('error', {'message': 'Game PIN is required'}, to=request.sid)
        return

    game = active_games.get(game_pin)
    if not game:
        emit('error', {'message': 'Invalid Game PIN'}, to=request.sid)
        return

    # Increment the question index
    game['current_question_index'] += 1

    if game['current_question_index'] >= len(game['questions']):
        # No more questions; end the game
        emit('game_over', {'message': 'Quiz is over!'}, to=game_pin)
        del active_games[game_pin]  # Remove the game from memory
        return

    # Send the next question to all connected players
    question = game['questions'][game['current_question_index']]
    for player in game['players']:
        emit('new_question', question, to=player['sid'])  # Emit to each player

    # Optionally, send to the host as well
    emit('new_question', question, to=game_pin)

@socketio.on('disconnect')
def on_disconnect():
    # Remove player or host from the game
    for game_pin, game in list(active_games.items()):
        if request.sid == game['host_sid']:
            # Notify all players that the host disconnected
            emit('game_ended', {'message': 'Host has disconnected. Game ended.'}, to=game_pin)
            del active_games[game_pin]
            break
        else:
            # Remove the player if they disconnected
            for player in game['players']:
                if player['sid'] == request.sid:
                    game['players'].remove(player)
                    emit('player_left', {'name': player['name']}, to=game['host_sid'])
                    break


# def submit_answer(data):
#     print("Hello from submit answer")
#     game_pin = data.get('gamePin')
#     selected_option = data.get('answer')  # Get the answer submitted by the player
#     player_sid = request.sid  # Get the player's socket ID
    
#     # Check if the game exists
#     game = active_games.get(game_pin)
#     if not game:
#         emit('error', {'message': 'Invalid Game PIN'}, to=player_sid)
#         return

#     # Get the current question index
#     current_question_index = game['current_question_index']
#     if current_question_index < 0:
#         emit('error', {'message': 'No question to answer'}, to=player_sid)
#         return

#     # Get the current question and its correct option
#     current_question = game['questions'][current_question_index]
#     correct_option = current_question['correct_option']

#     # Verify the selected answer
#     if selected_option == correct_option:
#         emit('answer_feedback', {
#             'correct': True,
#             'message': 'Correct answer! 🎉'
#         }, to=player_sid)
#     else:
#         emit('answer_feedback', {
#             'correct': False,
#             'message': f'Incorrect answer. The correct answer is {correct_option}.'
#         }, to=player_sid)

#     # Optionally, proceed to the next question
#     game['current_question_index'] += 1
#     if game['current_question_index'] < len(game['questions']):
#         next_question = game['questions'][game['current_question_index']]
#         emit('new_question', next_question, to=player_sid)
#     else:
#         emit('game_over', {'message': 'You have completed the quiz!'}, to=player_sid)


@socketio.on('submit_answer')
def submit_answer(data):
    game_pin = data.get('gamePin')
    selected_option = data.get('answer')  # Get the answer submitted by the player
    player_sid = request.sid  # Get the player's socket ID

    # Log incoming data
    print(f"Received answer: {selected_option} for gamePin: {game_pin}")

    # Check if the game exists
    game = active_games.get(game_pin)
    if not game:
        print(f"Game with PIN {game_pin} not found.")
        emit('error', {'message': 'Invalid Game PIN'}, to=player_sid)
        return

    # Get the current question index
    current_question_index = game['current_question_index']
    if current_question_index < 0:
        print(f"No question to answer.")
        emit('error', {'message': 'No question to answer'}, to=player_sid)
        return

    # Get the current question and its correct option
    current_question = game['questions'][current_question_index]
    correct_option = current_question.get('correct_option')

    if not correct_option:
        print("Correct option is undefined.")
        emit('error', {'message': 'Correct option not set for this question'}, to=player_sid)
        return

    # Initialize player scores if not already set
    if 'scores' not in game:
        game['scores'] = {}
    if player_sid not in game['scores']:
        game['scores'][player_sid] = 0

    # Verify the selected answer
    if selected_option == correct_option:
        print("Correct answer!")
        game['scores'][player_sid] += 1  # Increment score
        emit('answer_feedback', {
            'correct': True,
            'message': 'Correct answer! 🎉'
        }, to=player_sid)
    else:
        print(f"Incorrect answer. Correct answer is {correct_option}.")
        emit('answer_feedback', {
            'correct': False,
            'message': f'Incorrect answer. The correct answer is {correct_option}.'
        }, to=player_sid)

    # Track the player's answer
    if 'answers' not in game:
        game['answers'] = {}
    game['answers'][player_sid] = selected_option

    # Check if all players have answered
    if len(game['answers']) >= len(game['players']):
        # Move to the next question
        game['answers'].clear()  # Clear answers for the next question
        game['current_question_index'] += 1
        if game['current_question_index'] < len(game['questions']):
            next_question = game['questions'][game['current_question_index']]
            emit('new_question', next_question, to=game_pin)
        else:
            # Quiz is over; send scores to all players
            scores = {player['name']: game['scores'].get(player['sid'], 0) for player in game['players']}
            emit('game_over', {'message': 'Quiz is over!', 'scores': scores}, to=game_pin)
            
            # Notify the host that the quiz has ended
            host_sid = game.get('host_sid')
            if host_sid:
                emit('quiz_end', {'message': 'The quiz has ended. There are no more questions.'}, to=host_sid)
            
            # Clean up the game
            del active_games[game_pin]
    else:
        # Waiting for other players to answer
        print("Waiting for other players to answer...")



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)

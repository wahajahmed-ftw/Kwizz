from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super secret key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
app.config['SESSION_TYPE'] = 'filesystem'  # Ensure sessions are stored
db = SQLAlchemy(app)
CORS(app, supports_credentials=True)  # Allow credentials in CORS

# Models (unchanged)
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    owner_id = db.Column(db.Integer, nullable=False)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    options = db.Column(db.JSON, nullable=False)
    correct_option = db.Column(db.Integer, nullable=False)

class UserInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    password = db.Column(db.String(100))
    email = db.Column(db.String(100))

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



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

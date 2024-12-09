from flask import Flask,jsonify,request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app=Flask(__name__)
app.config['SECRET_KEY'] = 'super secret key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
db = SQLAlchemy(app)
CORS(app)

class UserInfo(db.Model):
    id=db.Column("id",db.Integer,primary_key=True)
    name=db.Column(db.String(100))
    password=db.Column(db.String(100))
    email=db.Column(db.String(100))

    def __init__(self, name, password, email):
        self.name=name
        self.password=password
        self.email=email
    # def __repr__(self):
    #     return f'<Conatacts {self.name}>'

@app.route("/home")
def home():
    return jsonify({'home':'hello world'})


@app.route("/signup",methods=['POST'])
def signup():
    name=request.json['name']
    password=request.json['password']
    email=request.json['email']
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


@app.route("/login", methods=['POST'])
def login():
    try:
        # Get JSON data from request
        email = request.json.get("email")
        password = request.json.get("password")

        # Check if email and password are provided
        if not email or not password:
            return jsonify({"message": "Email and password are required!"}), 400

        # Query the database for the user
        user = UserInfo.query.filter_by(email=email).first()

        # If user does not exist or password is incorrect
        if not user or user.password != password:
            return jsonify({"message": "Invalid email or password!"}), 401

        # Login successful
        return jsonify({"message": "Login successful!", "name": user.name}), 200

    except Exception as e:
        # Handle unexpected server errors
        return jsonify({"message": "An error occurred.", "error": str(e)}), 500
    
if __name__=='__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
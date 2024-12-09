from flask import Flask,jsonify,request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app=Flask(__name__)
app.config['SECRET_KEY'] = 'super secret key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
CORS(app)

@app.route("/home")
def home():
    return jsonify({'home':'hello world'})


@app.route("/signup",methods=['POST'])
def signup():
    name=request.json['name']
    password=request.json['password']
    email=request.json['email']
    print(name,email,password)
    return ("hwlo")


if __name__=='__main__':
    app.run(debug=True)
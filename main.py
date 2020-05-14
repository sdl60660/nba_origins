from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)
app.secret_key = '1234'

@app.route('/')
def homepage():
	return render_template('index.html')

if __name__ == "__main__":
    app.run(port=5453, debug=True)
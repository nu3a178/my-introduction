
#-----基本形-----
from flask import Flask,request,jsonify
from flask import render_template
import csv


app = Flask(__name__ )

@app.route("/")
def index():
    return render_template('index.html')

#--------------

@app.route("/spotifyAuthLogin")
def spotifyAuthLogin():
    return render_template('spotifyAuthLogin.html')

@app.route("/spotifyAuthCallback")
def spotifyAuthCallback():
    return render_template('spotifyAuthCallback.html')

@app.route("/saveToken",methods=["POST"])
def saveToken():
    data = request.get_json()
    print(data)
    tokens = {
      "accessToken" :data.get('access_token'),
      "refreshToken" : data.get('refresh_token'),
      "getDate" : data.get('get_date')
    }
    saveTokens(tokens)
    return "success"

@app.route("/updateToken",methods=["POST"])
def updateToken():
    data = request.get_json()
    tokens = {
      "accessToken" :data.get('access_token'),
      "refreshToken" : data.get('refresh_token'),
      "getDate" : data.get('get_date')
    }
    print(tokens)
    saveTokens(tokens)
    return "success"

@app.route("/getToken")
def getToken():
    with open('spotify_tokens.csv','r')as csvfile:
        csvreader = csv.reader(csvfile)
        data = next(csvreader)
        tokens = {
          "access_token" :data[0],
          "refresh_token" : data[1],
          "get_date" : data[2]
        }
        return jsonify(tokens)
    

def saveTokens(tokens):
    with open('spotify_tokens.csv','w')as csvfile:
        fieldnames=["accessToken","refreshToken","getDate"]
        csvwriter = csv.DictWriter(csvfile,fieldnames=fieldnames)
        csvwriter.writerow(tokens)
    

if __name__=='__main__':
    app.run()


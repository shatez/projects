from watson_developer_cloud import PersonalityInsightsV3
from flask import Flask, render_template, request, jsonify
from flask_cors import cross_origin
import atexit
import cf_deployment_tracker
import os
import json
import textrazor

textrazor.api_key = "f234149faa6f5e8e6dd790fe1e0db774d424d550f043a64aeebfaf0f"

# Emit Bluemix deployment event
cf_deployment_tracker.track()

app = Flask(__name__)

user = None
password = None
client = None


if 'VCAP_SERVICES' in os.environ:
    vcap = json.loads(os.getenv('VCAP_SERVICES'))
    print('Found VCAP_SERVICES')
    if 'personality_insights' in vcap:
        creds = vcap['personality_insights'][0]['credentials']
        user = creds['username']
        password = creds['password']
        url = creds['url']
        
elif os.path.isfile('vcap-local.json'):
    with open('vcap-local.json') as f:
        vcap = json.load(f)
        print('Found local VCAP_SERVICES')
        if 'personality_insights' in vcap['VCAP_SERVICES']:
            creds = vcap['VCAP_SERVICES']['personality_insights'][0]['credentials']
            user = creds['username']
            password = creds['password']
            url = creds['url']

print user,password

personality_insights = PersonalityInsightsV3(
    username=user,
    password=password)

# On Bluemix, get the port number from the environment variable PORT
# When running this app on the local machine, default the port to 8080
port = int(os.getenv('PORT', 8080))

@app.route('/', methods=['POST'])
@cross_origin()
def test():
    return "Working"

@app.route('/generate', methods=['POST'])
@cross_origin()
def generateViaWatson():
    text = request.form.get('text')
    sanitizedText = ''.join([i if ord(i) < 128  else '' for i in text])
    for i in sanitizedText:
        if ord(i)>127:
            print i, ord(i)
    # print sanitizedText
    # return str(text)
    return json.dumps(personality_insights.profile(text=sanitizedText, content_type='text/plain',raw_scores=True, consumption_preferences=True), indent=2)

@app.route('/textrazor', methods=['POST'])
@cross_origin()
def generateViaTextRazor():
    text = request.form.get('text')
    sanitizedText = ''.join([i if ord(i) < 128  else '' for i in text])
    for i in sanitizedText:
        if ord(i)>127:
            print i, ord(i)
    return json.dumps(trClient.analyze_url("http://www.bbc.co.uk/news/uk-politics-18640916").json['response'], indent=2)


@atexit.register
def shutdown():
    if client:
        client.disconnect()

if __name__ == '__main__':
    trClient = textrazor.TextRazor(extractors=["entities", "topics"])

    app.run(host='0.0.0.0', port=port, debug=True)

from http.server import BaseHTTPRequestHandler
from urllib import parse
import requests
import json

class handler(BaseHTTPRequestHandler):
    base_url  = "https://www.youtube.com/watch?v="

    def do_GET(self):
        s = self.path
        dic = dict(parse.parse_qsl(parse.urlsplit(s).query))
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        data = {"results" : ""}
        id = dic.get("id",None)
        url = self.base_url + id
        response = requests.get(url).text
        while "ytInitialData" not in response:
            response = requests.get(url).text
        start = (
                    response.index("ytInitialData")
                    + len("ytInitialData")
                    + 3
                )
        end = response.index("};", start) + 1
        json_str = response[start:end]
        data = json.loads(json_str)
        contents = data["contents"]["twoColumnWatchNextResults"]["secondaryResults"]["secondaryResults"]["results"]
        results = []
        for x in contents:
            if "compactVideoRenderer" in x.keys():
                results.append({
                    "videoId" : x["compactVideoRenderer"]["videoId"],
                    "thumbnail" : x["compactVideoRenderer"]["thumbnail"]["thumbnails"][-1]["url"],
                    "title" : x["compactVideoRenderer"]["title"]["simpleText"]
                })

        data = { "results" : results }
        data = json.dumps(data)
        self.wfile.write(data.encode(encoding='utf_8'))
        return
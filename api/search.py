from http.server import BaseHTTPRequestHandler
from urllib import parse
import requests
import json

class handler(BaseHTTPRequestHandler):
    SEARCH_URL = "https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&q="

    def do_GET(self):
        s = self.path
        dic = dict(parse.parse_qsl(parse.urlsplit(s).query))
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        data = {"data" : ""}
        q = dic.get("q",None)
        if q:
            res = requests.get(self.SEARCH_URL + q)
            data = {"data" : res.text}
            
        data = json.dumps(data)
        self.wfile.write(data.encode(encoding='utf_8'))
        return
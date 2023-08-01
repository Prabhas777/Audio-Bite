from http.server import BaseHTTPRequestHandler
from urllib import parse
from youtube_search import YoutubeSearch
import json

class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        s = self.path
        dic = dict(parse.parse_qsl(parse.urlsplit(s).query))
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        q = dic.get("q",None)
        results = YoutubeSearch(q, max_results=10).to_dict()
        data = {
            "results" : results
        }
        data = json.dumps(data)
        self.wfile.write(data.encode(encoding='utf_8'))
        return


import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../web');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  let rel;try {rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400);res.end();return;}
  const file=path.resolve(root,'.'+(rel.endsWith('/')?rel+'index.html':rel));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});
});
server.listen(Number(process.env.PORT||4174),'127.0.0.1',()=>console.log('Local: http://127.0.0.1:' + server.address().port));

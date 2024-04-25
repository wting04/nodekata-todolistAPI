//1.開啟伺服器
const http = require('http');
//2.回傳結果模組化
const headers = require('./headers');
const succHandle = require('./handleSuccess');
const errHandle = require('./handleError');
//3-1.代辦清單、uuid
const {v4: uuidv4} = require('uuid');
const handleSuccess = require('./handleSuccess');
const todos = [];

const requestLinstener = (req,res)=>{
    console.log(req.url);
    console.log(req.method);

    // const headers = {
    //     'Content-Type':'text-splain'
    // }

    let body = '';
    req.on('data', chunk => {
        body+=chunk;
    });

    //3-2.請求判斷方法 + node demo 2
    //4.POST程式段: Body封包(data, end)、end要做try carch 排除非JSON格式 + node demo 4
    //5.DELETE程式段*2 + node demo 5
    //6.PATCH程式段 + node demo 6
    if (req.url == '/todos' && req.method == "GET"){
        succHandle(res, todos);

    }else if (req.url == '/todos' && req.method == "POST"){
        req.on('end',()=>{
            try{
                const title = JSON.parse(body).title;
                if(title !== undefined){
                    const todo = {
                        "title": title,
                        "id": uuidv4()
                    }
                    todos.push(todo);
                    succHandle(res, todos);
                }else{
                    //無title屬性
                    errHandle(res);
                }

            }catch(error){
                //非JSON格式
                errHandle(res);
            }
        });
    }else if (req.url == '/todos' && req.method == "DELETE"){
        todos.length = 0; //清空
        succHandle(res, todos);
    }else if (req.url.startsWith('/todos/') && req.method == "DELETE"){
        const id = req.url.split('/').pop();
        const index = todos.findIndex(element => element.id == id);
        if(index !== -1){
            todos.splice(index,1); //刪除單筆
            succHandle(res,todos);
        }else{
            //查無此 todo id
            errHandle(res);
        }
    }else if (req.url.startsWith('/todos/') && req.method == "PATCH"){
        req.on('end',()=>{
            try{
                const todo = JSON.parse(body).title; //AS POST
                const id = req.url.split('/').pop(); //AS DELETE{id}
                const index = todos.findIndex(element => element.id == id); //AS DELETE{id}
                if(todo !== undefined && index !== -1){
                    todos[index].title = todo; //更新單筆內容
                    succHandle(res, todos);
                }else{
                    //無title屬性、查無此 todo id
                    errHandle(res);
                }

            }catch(error){
                //非JSON格式
            }
        });
    }
    //跨網域請求(部署雲端後才有效果
    else if (req.method == "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
    }
    else{
        res.writeHead(400, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網站路由"
        }));
        res.end();     
    }
}
const server = http.createServer(requestLinstener);
server.listen(process.env.PORT || 3005); //先取雲端主機預設的埠號

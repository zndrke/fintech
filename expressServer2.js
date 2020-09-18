// 복사본

const express = require("express");
const app = express();
const request = require("request");
const jwt = require("jsonwebtoken");
const auth = require('./lib/auth');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',	//db 변경
  user     : 'hospass_db',
  password : 'hospass123!@',
  database : 'hospass_db'
});
 
connection.connect();


app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

app.get('/signup', function (req, res) {
  res.render("signup");
});

app.get('/diagnosis', function (req, res) {
  res.render("diagnosis");
});

app.get('/authResult', function(req, res){
  console.log('authResult');
  console.log(req.query);
  var authCode = req.query.code;
  console.log(authCode);
  var option = {
      method : "POST",
      url : "https://testapi.openbanking.or.kr/oauth/2.0/token",
      header : {
          'Content-Type' : 'application/x-www-form-urlencoded'
      },
      form : {
          code : authCode,
          client_id : 'rimj9uTJYMs8F1wW7xfSqDtirHOgWzP0x6Gtb0eK', //key변경
          client_secret : 'aulHkwkFPRrpH35tz6FolBev6zVF3NTGPsgH2sLy',//secret변경
          redirect_uri : 'http://localhost:3000/authResult',
          grant_type : 'authorization_code'
      }
  }
  request(option, function (error, response, body) {
      console.log(body);
      var requestResultJSON = JSON.parse(body);
      res.render('resultChild',{data : requestResultJSON})
  });
})

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/main_2", function (req, res) {
  res.render('main_2');
});

app.get("/balance", function (req, res) {
  res.render('balance');
});

app.get("/qrcode", function (req, res) {
  res.render('qrcode');
});

app.get("/qrreader", function (req, res) {
  res.render('qrreader');
});

app.post("/login", function (req, res) {
  console.log("사용자 입력정보 :", req.body);
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [userEmail], function (error, results, fields) {
    if (error) throw error;
    else {
      if (results.length == 0) {
        res.json("등록되지 않은 아이디 입니다.");
      } else {
        var dbPassword = results[0].password;
        if (userPassword == dbPassword) {
          var tokenKey = "fintech";
          jwt.sign(
            {
              userId: results[0].id,
              userEmail: results[0].email,
            },
            tokenKey,
            {
              expiresIn: "10d",
              issuer: "fintech.admin",
              subject: "user.login.info",
            },
            function (err, token) {
              console.log("로그인 성공", token);
              res.json(token);
            }
          );
        } else {
          res.json("비밀번호가 다릅니다!");
        }
      }
    }
  });
});

app.post('/signup', function(req, res){
  var userName = req.body.userName;
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;
  console.log(userAccessToken, userRefreshToken, userSeqNo)
  var sql = "INSERT INTO user"+
  " (name, email, password, accesstoken, refreshtoken, userseqno)"+
  " VALUES (?, ?, ?, ?, ?, ?)"
  connection.query(sql,[userName, userEmail, userPassword,
      userAccessToken, userRefreshToken, userSeqNo], function (error, results, fields) {
      if (error) throw error;
      res.json('가입완료');
  });
})

app.post("/balance", auth, function(req, res){
  var userId = req.decoded.userId;
  var fin_use_num = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991637220U" + countnum;

  console.log("유저 아이디, 핀테크번호 : ", userId, fin_use_num);
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          bank_tran_id: transId,
          fintech_use_num: fin_use_num,
          tran_dtime: "20200615114200",
          //#자기 키로 시크릿 변경
        },
      };
      request(option, function (error, response, body) {
        var listResult = JSON.parse(body);
        console.log(listResult);
        res.json(listResult);
      });
    }
  });
});

app.post("/transactionList", auth, function (req, res){
  var userId = req.decoded.userId;
  var fin_use_num = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991637220U" + countnum;

  console.log("유저 아이디, 핀테크번호 : ", userId, fin_use_num);
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          bank_tran_id: transId,
          fintech_use_num: fin_use_num,
          inquiry_type: "A",
          inquiry_base: "D",
          from_date: "20190101",
          to_date: "20190101",
          sort_order: "D",
          tran_dtime: "20200615134500",
          //#자기 키로 시크릿 변경
        },
      };
      request(option, function (error, response, body) {
        console.log(body);
        res.json(body);
      });
    }
  });


});

app.post("/withdraw", auth, function (req, res) {
  var userId = req.decoded.userId;
  var amount = req.body.amount;
  var fin_use_num = req.body.fin_use_num;
  var to_fin_use_num = req.body.to_fin_use_num;
  console.log("유저 아이디, 출금할 핀테크번호, 입금할 핀테크번호 : ", userId, fin_use_num, to_fin_use_num, amount);

  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991599190U" + countnum; //이용기과번호 본인것 입력

  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "POST",
        url: "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/json",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        json: {
          bank_tran_id: transId,
          cntr_account_type: "N",
          cntr_account_num: "7015844580",
          dps_print_content: "쇼핑몰환불",
          fintech_use_num: fin_use_num,
          wd_print_content: "오픈뱅킹출금",
          tran_amt: "1000",
          tran_dtime: "20200721114000",
          req_client_name: "홍길동",
          req_client_fintech_use_num: fin_use_num,
          transfer_purpose: "ST",
          req_client_num: "7015844580",
          recv_client_name: "백주리",
          recv_client_bank_code: "097",
          recv_client_account_num: "7015844580",
        },
      };
      request(option, function (error, response, body) {
        console.log(body);
        var countnum2 = Math.floor(Math.random() * 1000000000) + 1;
        var transId2 = "T991637220U" + countnum2; //이용기과번호 본인것 입력
        
        var option = {
          method: "POST",
          url:
            "https://testapi.openbanking.or.kr/v2.0/transfer/deposit/fin_num",
          headers: {
            Authorization:
              "Bearer " +
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUOTkxNjQxNTIwIiwic2NvcGUiOlsib29iIl0sImlzcyI6Imh0dHBzOi8vd3d3Lm9wZW5iYW5raW5nLm9yLmtyIiwiZXhwIjoxNjAzMDg2NjM2LCJqdGkiOiI5NWJkMGFhMy1lMWJkLTQyYjktYTA5YS0wNWQ1NTY5M2Q3Y2YifQ.zYEQ2xuRuEvZ5avCkvpD7D12PzDgIJBuVoVWuaJFZ3I",
            "Content-Type": "application/json",
          },
          //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
          json: {
            cntr_account_type: "N",
            cntr_account_num: "6021513107",
            wd_pass_phrase: "NONE",
            wd_print_content: "환불금액",
            name_check_option: "on",
            tran_dtime: "20200721114000",
            req_cnt: "1",
            req_list: [
              {
                tran_no: "1",
                bank_tran_id: transId2,
                fintech_use_num: to_fin_use_num,
                print_content: "쇼핑몰환불",
                tran_amt: amount,
                req_client_name: "홍길동",
                req_client_fintech_use_num: "199164152057885115705186",
                req_client_num: "HONGGILDONG1234",
                transfer_purpose: "ST",
              },
            ],
          },
        };
        request(option, function (error, response, body) {
          console.log(body);
        });
      });
    }
  });
});

app.post("/getLoginData", function (req, res) {
  var userId = req.body.ajaxUserId;
  var userPassword = req.body.ajaxUserPassword;
  console.log("req body : ", req.body);
  console.log(userId, userPassword);

  res.json(userId + "분의 로그인 성공입니다.");
});

app.get("/designTest", function (req, res) {
    res.render("design");
  });

/*=============================================================================================================*/
app.get("/reservation", function (req, res) {
  res.render('reservation');
});

app.get("/gocoder_qrcode", function (req, res) {
  res.render("gocoder_qrcode");
});

app.post("/gocoder_qrcode", function (req, res) {
  
  var sql = "SELECT * FROM receipt WHERE user = '3'";
  connection.query(sql, function (error, results){
    if(error) console.log('query is not excuted. select fail...\n' + err);
    else {
      console.log(results);
  
      res.json(results);
    } 
    
  })
  
});

app.get('/pay', function(req, res){
  res.render('pay');
})

app.get('/receipt_list', function(req,res){
  res.render('receipt_list');
})

app.post('/pay',function(req,res){
  
  var userId = 3;
  var sql = "SELECT * FROM receipt WHERE user = ?";
  connection.query(sql,[userId], function(err, result){
      
      if(err) throw err;
      else{
          res.json(result);
      // var advise = result[0].userAdvise;
      // var paymentinfo = result[0].userPaymentInfo;
      // var payment = result[0].userPayment;
      // var prescription = result[0].userPrescription;
      
      }        
      
      console.log(result);
  })
})
app.post('/receipt',function(req,res){
  
  var userId = 3;
  var sql = "SELECT * FROM receipt WHERE user = ?";
  connection.query(sql,[userId], function(err, result){
      
      if(err) throw err;
      else{
          res.json(result);
      }        
      console.log(result);
  })
})

app.get("/account", function (req, res) {
  res.render("account");
});
app.get("/receipt", function (req, res) {
  res.render("receipt");
});
app.get("/logo", function (req, res) {
  res.render("logo");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/main", function (req, res) {
  res.render("main");
});
app.get("/accountdelete", function (req, res) {
  res.render("accountdelete");
});
app.get("/accountput", function (req, res) {
  res.render("accountput");
});
app.post('/accountdelete',function(req,res) {
    
  var userId = 3;
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql,[userId], function(err, result){
      
      if(err) throw err;
      else 
      {
        res.json(result);
        var name = result[0].name;
        var email = result[0].email;
        var userseqno = result[0].userseqno;
        var advise = result[0].userAdvise;
        var paymentinfo = result[0].userPaymentInfo;
        var payment = result[0].userPayment;
        var prescription = result[0].userPrescription;
        
      }        
      
      console.log(result);
  })
})
app.post("/list", auth, function (req, res) {
  var userId = req.decoded.userId;
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/user/me",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          user_seq_no: results[0].userseqno,
          //#자기 키로 시크릿 변경
        },
      };
      request(option, function (error, response, body) {
        var listResult = JSON.parse(body);
        console.log(listResult);
        res.json(listResult);
      });
    }
  });
});

app.post('/diagnosis', function(req, res){
  var userAdvise = req.body.userAdvise;
  //console.log(userAdvise)
  var sql = "UPDATE receipt SET advise=? WHERE user = '3'"
  connection.query(sql,[userAdvise], function (error, results, fields) {
      if (error) throw error;
      res.json('저장완료');
  });
})

app.listen(3000, function () {
  console.log("Example app listening at http://localhost:3000");
});

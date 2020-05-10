const express = require('express');
const router = express();
const crypto = require('crypto');
const https = require('https');



// const db = require('../Models/db');
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI || "mongodb+srv://bintech:1234@dbbintech-zalgy.gcp.mongodb.net/test?retryWrites=true&w=majority";
const db = '1712879_mydata';
const categories = [{ "_id": "5e68b48da6498a4bac6c496f", "MA_LOAI_HANG": "LH001", "TEN_LOAI": "Điện thoại Smartphone", "MA_DANH_MUC": "DN001" }, { "_id": "5e68b48da6498a4bac6c4971", "MA_LOAI_HANG": "LH003", "TEN_LOAI": "Máy đọc sách", "MA_DANH_MUC": "DN001" }, { "_id": "5e68b48da6498a4bac6c4972", "MA_LOAI_HANG": "LH004", "TEN_LOAI": "Tivi", "MA_DANH_MUC": "DN002" }, { "_id": "5e68b48da6498a4bac6c4978", "MA_LOAI_HANG": "LH010", "TEN_LOAI": "Máy ảnh", "MA_DANH_MUC": "DN004" }];

router.get('/', async (request, response) => {
    categories.forEach(c => {
        if(c.MA_LOAI_HANG == 'LH001') c.isActive = 'font-weight-bolder isActive';
        else c.isActive = '';
    })
    console.log(__dirname)
    let client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect((err, result) => {

        const dbo = client.db(db).collection('products');
        dbo.find({ MA_LOAI_HANG: "LH001" })
            .toArray((err, result) => {
                if (err) throw err;
                // console.log(result)
                response.render('products', { categories: categories, products: result});
            })
    })
    client.close();

})

router.get('/categories/:id', async (request, response) => {
    const {id} = request.params;
    categories.forEach(c => {
        if(c.MA_LOAI_HANG == id) c.isActive = 'font-weight-bolder isActive';
        else c.isActive = '';
    })
    let client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect((err, result) => {

        const dbo = client.db(db).collection('products');
        dbo.find({ MA_LOAI_HANG: request.params.id })
            .toArray((err, result) => {
                if (err) throw err;
                // console.log(result)
                return response.render('products', { categories: categories, products: result });
            })
    })
    client.close();
})

router.get('/product/:id', async (request, response) => {
    let client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect((err, result) => {
        const dbo = client.db(db).collection('products');
        dbo.find({ MA_SAN_PHAM: request.params.id })
            .toArray((err, result) => {
                if (err) throw err;
                result = result[0] || {};
                return response.render('ProductDetail', { data: result });
            })
    });
    client.close();

})


// thông tin về tài khoản MOMO ở bước 2
const partnerCode = 'MOMOFXF120200430';
const accessKey = 'eZbOjvZUs4KmLzzb';
const serectkey = 'wSWBmpf52GtRiEIpv1YhE2IMQTNEx0ME';
const returnUrl = process.env.URL_CALLBACK || 'http://localhost:3000/comfirm';
const notifyurl =  process.env.URL_CALLBACK || 'http://localhost:3000/comfirm';
const requestType = "captureMoMoWallet";
const extraData = "key=test1";

router.get('/payment/:id/:amount', async (request, response) => {
    // Tạo mã requestId
    const requestId = 'REQ' + getRndInteger(100,1000);
    // Số tiền giao dịch
    const amount = request.params.amount;
    // tạo mã đơn hàng orderId
    const orderId = 'OR' + request.params.id + getRndInteger(100,1000);
    const orderInfo = 'demo_test_MOMO';
    var rawSignature = "partnerCode=" + partnerCode + "&accessKey=" + accessKey + "&requestId=" + requestId + "&amount=" + amount + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&returnUrl=" + returnUrl + "&notifyUrl=" + notifyurl + "&extraData=" + extraData;
    var signature = crypto.createHmac('sha256', serectkey)
        .update(rawSignature)
        .digest('hex');
    
    var body = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        returnUrl: returnUrl,
        notifyUrl: notifyurl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
    })
    var options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/gw_payment/transactionProcessor',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };
    var req = await https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (body) => {
            response.redirect(JSON.parse(body).payUrl);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });
    req.write(body);
    req.end();
})

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

router.get('/comfirm', (req, res) => {
    // console.log(req.query)
    var data = Object.assign([], req.query);
    data.isSuccess = false;
    if(req.query.errorCode == '0'){
        data.isSuccess = true;
    }
    res.render('Comfirm', {data: data});
})

module.exports = router;
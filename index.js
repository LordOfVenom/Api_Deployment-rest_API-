let express=require('express')
let app=express();
let dotenv= require('dotenv');
dotenv.config()
let port=process.env.PORT || 5622;
let mongo = require('mongodb');
let MongoClient= mongo.MongoClient; 
let mongoURL = process.env.LiveMongo;
let cors = require('cors')
let bodyParser = require('body-parser');
let db;

//middleware
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())

app.get('/',(req,res)=>{
    res.send("Hii from your handosome boy mahesh")
})
//// Now lets us create multiple routes using the same port
/////list of api
//list of location
// app.get('/location',(req,res)=>{
//     db.collection('location').find().toArray((err,result)=>{
//         if(err) throw err;
//         res.send(result)
//     })
// })
// // ///////creating a param for the location//////
// app.get('/location/:stateId',(req,res)=>{
//     let stateId=Number(req.params.stateId)
//     db.collection('location').find({state_id:stateId}).toArray((err,result)=>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

///////creating a queryparam for the location//////
app.get('/location',(req,res)=>{
    let stateiod=Number(req.query.stateiod)
    let query ={}
    if (stateiod){
        query={state_id:stateiod}
    }else{
        query={}
    }
    db.collection('zomato').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})
//list of all cities
app.get('/city',(req,res)=>{
    db.collection('city').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})
//list of all meal type
app.get('/filter/:mealId',(req,res)=>{
    let query={};
    let sort ={cost:1}
    let mealId = Number(req.params.mealId);
    let cuisineId = Number(req.query.cuisineId);
    let lcost = Number(req.query.lcost);
    let hcost = Number(req.query.hcost);

    if (req.query.sort){
        sort={cost:req.query.sort}
    }

    if(hcost && lcost && cuisineId){
        query={
            "mealTypes.mealtype_id":mealId,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    else if(hcost && lcost){
        query={
            "mealTypes.mealtype_id":mealId,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    else  if(cuisineId){
        query={
            "mealTypes.mealtype_id":mealId,
            "cuisines.cuisine_id":cuisineId
        }
    }
    else{
        query={
            "mealTypes.mealtype_id":mealId,
        }
    }
    db.collection('zomato').find(query).sort(sort).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

//list of all resturant as per the cusin
app.get('/details/:restId',(req,res)=>{
    let restId=Number(req.params.restId)
    db.collection('zomato').find({restaurant_id:restId}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

//list of all menutype wrt resturant 
app.get('/menu/:menuId',(req,res)=>{
    let menuId=Number(req.params.menuId)
    db.collection('menu').find({restaurant_id:menuId}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

//order
app.get('/orders',(req,res)=>{
    let email =req.query.email;
    let query={}
    if(email){
        query={email}
    }else{
        query={}
    }

    db.collection('orders').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})
//PRODUCT_order
app.get('/pdtorders',(req,res)=>{
    let email =req.query.email;
    let query={}
    if(email){
        query={email}
    }else{
        query={}
    }

    db.collection('product_orders').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})
//place order
app.post('/menuItem',(req,res)=>{
    if(Array.isArray(req.body.id)){
        db.collection('menu').find({menu_id:{$in:req.body.id}}).toArray((err,result)=>{
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Invalid Input')
    }
})




//place of the order or posting of the order
app.post('/placeOrder',(req,res)=>{
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send('Order Placed')
    })
})
///another one
app.post('/placeTestOrder',(req,res)=>{
    db.collection('test_order').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send('Order Placed')
    })
})



//update order
app.put('/updateOrder/:id',(req,res)=>{
    let oid=Number(req.params.id);
    db.collection('product_orders').updateOne(
        {id:oid},
        {
            $set:{
                "status":req.body.status,
                "bank_name":req.body.bank_name,
                "date":req.body.date
            }
        },(err,result)=>{
            if(err) throw err;
            res.send('Order Updated')
        }
    )
})
//Delete order
app.delete('/deleteOrder/:id',(req,res)=>{
    let _id=mongo.ObjectId(req.params.id);
    db.collection('product_orders').remove({_id},(err,result)=>{
        if(err)throw err;
        res.send('Order Deleted')
    })
})

/////Connection with db
MongoClient.connect(mongoURL,(err,client)=>{
    if(err) console.log('Error while connecting');
    db=client.db('Edureka_Api');
    app.listen(port,()=>{
        console.log(`port is running on the server on the port ${port}`)
    })
})


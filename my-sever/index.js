const express = require("express")
const app = express()
const port = 3000
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
app.use(morgan("combined"));

const bodyParser = require("body-parser")
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));
app.use(cookieParser());

const cors = require("cors");
app.use(cors())
app.listen(port, () => {
  console.log(`My Service start at port ${port}`)
})

app.get("/", (req, res) => {
  res.send("This is my Restful API service")
})

const { MongoClient, ObjectId } = require("mongodb");
client = new MongoClient("mongodb://127.0.0.1:27017");
client.connect();
database = client.db("ClayCoDatabase");
productsCollection = database.collection("ProductsData");
customerCollection = database.collection("CustomerData");
orderCollection = database.collection("OrderData");
categoryCollection = database.collection("CategoryData")
accountCollection = database.collection("AccountCustomerData");
deliveryCustomerCollection = database.collection("DeliveryCustomerData");

// Thông tin của Sản phẩm
app.get("/products", cors(), async (req, res) => {
  const result = await productsCollection.find({}).toArray();
  result.sort((a, b) => {
    const dateA = new Date(a.Create_date);
    const dateB = new Date(b.Create_date);
    return dateB.getTime() - dateA.getTime(); // Sort by descending order
  });
  res.send(result);
});

app.get("/products/detail/:id", cors(), async (req, res) => {
  var o_id = new ObjectId(req.params["id"]);
  const result = await productsCollection.find({ _id: o_id }).toArray();
  res.send(result[0]);
});

app.get("/products/:category", cors(), async (req, res) => {
  const category = req.params["category"];
  const result = await productsCollection
    .find({ Category: category })
    .toArray();
  res.send(result);
});

app.post("/products", cors(), async (req, res) => {
  //put json into database
  await productsCollection.insertOne(req.body);
  //send message to client(send all database to client)
  res.send(req.body);
});

app.put("/products", cors(), async (req, res) => {
  //update json products into database
  await productsCollection.updateOne(
    { _id: new ObjectId(req.body._id) }, //condition for update
    {
      $set: {
        //Field for updating  
        Name: req.body.Name,
        Price: req.body.Price,
        Image: req.body.Image,
        Description: req.body.Description,
        Origin: req.body.Origin,
        Uses: req.body.Uses,
        Customizable: req.body.Customazable,
        Store: req.body.Store,
        Category: req.body.Category,
        Quantity: req.body.Quantity
      },
    }
  );
  //send products after updating
  var o_id = new ObjectId(req.body._id);
  const result = await productsCollection.find({ _id: o_id }).toArray();
  res.send(result[0]);
});

app.delete("/products/:id", cors(), async (req, res) => {
  //find detail products with id
  var o_id = new ObjectId(req.params["id"]);
  const result = await productsCollection.find({ _id: o_id }).toArray();
  //update json products into database
  await productsCollection.deleteOne({ _id: o_id });
  //send products after remove
  res.send(result[0]);
});

app.get('/search', cors(), async (req, res) => {
  const keyword = req.query.keyword;
  const productsCollection = database.collection('ProductsData');
  const query = { Name: { $regex: keyword, $options: 'i' } };
  const products = await productsCollection.find(query).toArray();
  res.send(products);
});

// Lấy thông tin Category
app.get("/categories", cors(), async (req, res) => {
  const result = await categoryCollection.find({}).toArray();
  res.send(result);
})

app.get("/categories/:id", cors(), async (req, res) => {
  var o_id = new ObjectId(req.params["id"]);
  const result = await categoryCollection.find({ _id: o_id }).toArray();
  res.send(result[0]);
});

// Get categories by name
app.get("/categories/category/:name", cors(), async (req, res) => {
  try {
    const result = await categoryCollection.find({ Name: { $regex: new RegExp(req.params["name"], "i") } }).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

app.put("/categories", cors(), async (req, res) => {
  //update json products into database
  await categoryCollection.updateOne(
    { _id: new ObjectId(req.body._id) }, //condition for update
    {
      $set: {
        //Field for updating  
        Name: req.body.Name,
        Description: req.body.Description,
      },
    }
  );
  //send Category after updating
  var o_id = new ObjectId(req.body._id);
  const result = await categoryCollection.find({ _id: o_id }).toArray();
  res.send(result[0]);
});

app.post("/categories", cors(), async (req, res) => {
  //put json into database
  await categoryCollection.insertOne(req.body);
  //send message to client(send all database to client)
  res.send(req.body);
});

app.delete("/categories/:id", cors(), async (req, res) => {
  //find detail Category with id
  var o_id = new ObjectId(req.params["id"]);
  const result = await categoryCollection.find({ _id: o_id }).toArray();
  //update json Category into database
  await categoryCollection.deleteOne({ _id: o_id });
  //send Category after remove
  res.send(result[0]);
});

//Thông tin của Giỏ hàng
const session = require('express-session');
const { hasSubscribers } = require('diagnostics_channel');
app.use(session({ secret: "Shh, its a secret!" }));
app.get("/contact", cors(), (req, res) => {
  if (req.session.visited != null) {
    req.session.visited++
    res.send("You visited this page " + req.session.visited + " times")
  }
  else {
    req.session.visited = 1
    res.send("Welcome to this page for the first time!")
  }
})

app.post("/cart/", cors(), (req, res) => {
  const product = req.body
  if (req.session.carts == null) {
    req.session.carts = []
  }
  const existingproduct = req.session.carts.find((c) => c._id === product._id);

  if (existingproduct) {
    // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng sản phẩm của sản phẩm đó
    existingproduct.quantity += product.quantity;
  } else {
    req.session.carts.push(product)
  }
  res.send(product)
})
app.get("/cart", cors(), (req, res) => {
  res.send(req.session.carts)
})
app.get("/cart/:id", cors(), (req, res) => {
  if (req.session.carts != null) {
    p = req.session.carts.find(x => x.barcode == req.body.barcode)
    res.send(p)
  }
  else
    res.send(null)
})
app.delete("/cart/delete/:id", cors(), (req, res) => {
  if (req.session.carts != null) {
    id = req.params["id"]
    req.session.carts = req.session.carts.filter(x => x._id !== id);
  }
  res.send(req.session.carts)
})
app.put("/cart", cors(), (req, res) => {
  if (req.session.carts != null) {

    p = req.session.carts.find(x => x._id == req.body._id)
    if (p != null) {
      p.quantity = req.body.quantity
    }
  }
  res.send(req.session.carts)
})

//Thông tin của Khách hàng
app.get("/accounts", cors(), async (req, res) => {
  const result = await accountCollection.find({}).toArray();
  res.send(result);
});

app.get("/accounts/:phonenumber", cors(), async (req, res) => {
  const phone = req.params["phonenumber"];
  const result = await accountCollection
    .find({ phonenumber: phone })
    .toArray();
  res.send(result[0]);
});

app.get("/customers", cors(), async (req, res) => {
  const result = await customerCollection.find({}).toArray();
  res.send(result);
});

app.get("/customer", cors(), async (req, res) => {
  const result = await customerCollection.find({}).toArray();
  res.send(result);
});

app.get("/customer/:id", cors(), async (req, res) => {
  var o_id = new ObjectId(req.params["id"]);
  const result = await customerCollection.find({ _id: o_id }).toArray();
  res.send(result[0])
})

app.get("/customers/:phonenumber", cors(), async (req, res) => {
  var phone = req.params["phonenumber"];
  const result = await customerCollection.find({ Phone: phone }).toArray();
  res.send(result[0])
});


app.post("/customers", cors(), async (req, res) => {
  //put json Customer into database
  await customerCollection.insertOne(req.body);
  //send message to client(send all database to client)
  res.send(req.body);
});

app.put("/customers", cors(), async (req, res) => {
  await customerCollection.updateOne(
    { _id: new ObjectId(req.body._id) }, //condition for update
    {
      $set: {
        //Field for updating
        CustomerName: req.body.CustomerName,
        Phone: req.body.Phone,
        Mail: req.body.Mail,
        BOD: req.body.BOD,
        Gender: req.body.Gender,
        Image: req.body.Image
      },
    }
  )
  var o_id = new ObjectId(req.body._id);
  const result = await customerCollection.find({ _id: o_id }).toArray();
  res.send(result[0])
});

app.put("/customers", cors(), async (req, res) => {
  await customerCollection.updateOne(
    { _id: new ObjectId(req.body._id) }, //condition for update
    {
      $set: {
        //Field for updating
        CustomerName: req.body.CustomerName,
        Phone: req.body.Phone,
        Mail: req.body.Mail,
        BOD: req.body.BOD,
        Gender: req.body.Gender,
      },
    }
  )
  var o_id = req.params._id;
  const result = await customerCollection.find({ _id: o_id }).toArray();
  res.send(result[0])
});


app.get("/delivery", cors(), async (req, res) => {
  const result = await deliveryCustomerCollection.find({}).toArray();
  res.send(result);
});

app.post("/delivery", cors(), async (req, res) => {
  await deliveryCustomerCollection.insertOne(req.body)
  res.send(req.body)
})

app.get("/delivery/:phonenumber", cors(), async (req, res) => {
  var phone = req.params["phonenumber"];
  const result = await deliveryCustomerCollection.find({ Phone: phone }).toArray();
  res.send(result[0])
});

app.put("/delivery", cors(), async (req, res) => {
  await deliveryCustomerCollection.updateOne(
    { _id: new ObjectId(req.body._id) }, //condition for update
    {
      $set: {
        //Field for updating
        Address: req.body.Address,
      },
    }
  )
  var o_id = req.params._id;
  const result = await deliveryCustomerCollection.find({ _id: o_id }).toArray();
  res.send(result[0])
})

//Đăng ký và Đăng nhập
app.post("/accounts", cors(), async (req, res) => {
  var crypto = require('crypto');
  salt = crypto.randomBytes(16).toString('hex');
  userCollection = database.collection("AccountCustomerData");
  user = req.body;
  hash = crypto.pbkdf2Sync(user.password, salt, 1000, 64, `sha512`).toString(`hex`);
  user.password = hash;
  user.salt = salt
  await userCollection.insertOne(user)
  res.send(req.body)
})

app.post('/login', cors(), async (req, res) => {
  const { phonenumber, password } = req.body;
  const crypto = require('crypto');
  const userCollection = database.collection('AccountCustomerData');
  const user = await userCollection.findOne({ phonenumber });
  if (user == null) {
    res.status(401).send({ message: 'Unexisted username' });
  } else {
    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
    if (user.password === hash) {
      res.send(user);
    } else {
      res.status(401).send({ message: 'False password' });
    }
  }
});

app.put('/change-password', cors(), async (req, res) => {
  const { phonenumber, oldPassword, newPassword } = req.body;
  const crypto = require('crypto');
  const userCollection = database.collection('AccountCustomerData');
  const user = await userCollection.findOne({ phonenumber });
  if (user == null) {
    res.status(401).send({ message: 'Unexisted username' });
  } else {
    const oldHash = crypto.pbkdf2Sync(oldPassword, user.salt, 1000, 64, `sha512`).toString(`hex`);
    if (user.password !== oldHash) {
      res.status(401).send({ message: 'False old password' });
    } else {
      const newSalt = crypto.randomBytes(16).toString(`hex`);
      const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 1000, 64, `sha512`).toString(`hex`);
      await userCollection.updateOne({ phonenumber }, { $set: { password: newHash, salt: newSalt } });
      res.send({ message: 'Change password successfully' });
    }
  }
});

app.get("/orders", cors(), async (req, res) => {
  const result = await orderCollection.find({}).toArray();
  res.send(result);
});

app.get("/orders/:id", cors(), async (req, res) => {
  var o_id = new ObjectId(req.params["id"]);
  const result = await orderCollection.find({ _id: o_id }).toArray();
  res.send(result[0])
})

app.post("/orders", cors(), async (req, res) => {
  await orderCollection.insertOne(req.body);
  //send message to client(send all database to client)
  res.send(req.body);
});

app.delete("/orders/:id", cors(), async (req, res) => {
  //find detail Order with id
  var o_id = new ObjectId(req.params["id"]);
  const result = await orderCollection.find({ _id: o_id }).toArray();
  //update json Order into database
  await orderCollection.deleteOne({ _id: o_id });
  //send Order after remove
  res.send(result[0]);
});

app.put("/orderConfirm/:id", cors(), async (req, res) => {
  var o_id = new ObjectId(req.params["id"]);
  //update json Order into database
  await orderCollection.updateOne(
    { _id: o_id }, //condition for update
    {
      $set: {
        //Field for updating
        Status: "Confirmed"
      },
    }
  );
  //send Order after updating
  var o_id = new ObjectId(req.body._id);
  const result = await orderCollection.find({ _id: o_id }).toArray();
  res.send(result[0]);
});

app.put("/orders", cors(), async (req, res) => {
  await orderCollection.updateOne(
    { _id: new ObjectId(req.body._id) },
    {
      $set: {
        Status: req.body.Status
      },
    }
  );
  //send Order after updating
  var o_id = new ObjectId(req.body._id);
  const result = await orderCollection.find({ _id: o_id }).toArray();
  res.send(result[0]);
});

//Get order by customer name
app.get("/orders/customer/:name", cors(), async (req, res) => {
  const customerName = req.params["name"];
  const result = await orderCollection.find({ CustomerName: customerName }).toArray();
  res.send(result);
});

app.get('/search', cors(), async (req, res) => {
  const keyword = req.query.keyword;
  const productsCollection = database.collection('ProductsData');
  const query = { Name: { $regex: keyword, $options: 'i' } };
  const products= await productsCollection.find(query).toArray();
  res.send(products);
});
const express =require('express');
const mongoose =require('mongoose');
const bodyparser=require('body-parser')
const cookieparser=require('cookie-parser')
const jwttoken=require('jsonwebtoken')
const usermodel=require('./Model/usermodel')
const bcrypt=require('bcryptjs');

const app=express();
const secretkey="abcdefghijklmnop";
app.use(bodyparser.json({extended:"true"}))
app.use(cookieparser())

app.post('/signin',async(req,res)=>{
    try{
    const {name,email,password}=req.body
    const userpassword=await hashgenerate(password)
    const data=await usermodel.create({username:name,email:email,password:userpassword})
    res.json(data)
    }
    catch(err)
    {
          res.send(err)
    }
})

app.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body;
        const data=await usermodel.findOne({email:email})
        console.log(data)
        const user=await hashverify(data,password)
        if(user===true)
        {
            const token=await tokengenerator(data.email)
             res.cookie("jwt", token,{httpOnly:true});
            console.log(req.cookies.jwts)
            res.json(token)
        }
        else{
            res.send("Incorrect user!!!")
        }
    }
    catch(err)
    {
       res.send(err)
    }
})
const tokenVerify = (req, res, next) => {
    try {
      const token = req.cookies.jwt;
      if (!token) {
        return res.status(401).send("Access Denied JWT missing.");
      }
  
      try {
        jwttoken.verify(token, secretkey);
        next();
      } catch (err) {
        return res.status(401).send("Access Denied Invalid JWT");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Server Error.");
    }
  };
  
  





app.get("/home",tokenVerify,(req,res)=>{
    res.send("This is the home page ")
})

   
const hashgenerate=async(password)=>{
    try{
    const saltround=10;
    const salt=await bcrypt.genSalt(saltround)
    const hashpassword= await bcrypt.hash(password,salt)
    return hashpassword;
    }
    catch(err)
    {
         console.log(err)
    }
}


const hashverify=async(data,userpassword)=>{
  

    try{
       
        const {username,email,password}=data
        const verify=await bcrypt.compare(userpassword,password)
        return verify;
    }
    catch(err)
    {
         console.log(err)
    }

}


const tokengenerator=(email)=>{

    try{
        const token=jwttoken.sign(
            {"email":email},
            secretkey,
            {expiresIn:"2m"}
        )
        return token;

    }
    catch(err)
    {
        res.send(err)
    }

}



mongoose.connect("mongodb://127.0.0.1:27017/JWT").then(()=>{
    console.log("Mongodb connected successfully")
}).catch(err=>{
    console.log(err)
})


app.listen(5000,()=>{
    console.log("Server is running on the port 5000")
})

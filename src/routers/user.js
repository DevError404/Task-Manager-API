const express = require('express')
const User = require('../models/user')
const auth = require('../middlewares/auth')
const multer = require('multer')

const router = new express.Router()

//create new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
 
    try {
         await user.save()
         const token = await user.generateAuthToken()
         res.status(201).send({ user, token })
    } catch (e) {
     res.status(400).send()
    }
    
 })

 //login user
 router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCrdentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
 })

 router.post('/users/logout', auth, async(req, res) => {
     try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
     } catch(e) {
        res.status(500).send()
     }
 })
 
 router.post('/users/logoutAll', auth, async(req, res) => {
    try{
       req.user.tokens = []
       await req.user.save()
       res.send()
    } catch(e) {
       res.status(500).send()
    }
})

 //get users
 router.get('/users/me', auth ,async (req, res) => {
 
    res.send(req.user)
    //  try {
    //      const users = await User.find({})
    //      res.send(users)
    //  } catch (e) {
    //      res.status(500).send()
    //  }
     
 })
 

 //get perticular user
//  router.get('/users/:id', async (req, res) => {
//      const _id = req.params.id
//      try {
//          const user = await User.findById(_id)
//          res.status(404).send()
//      } catch (e) {
//          res.status(500).send(e)
//      }
     
//  })
 
 //update user before auth
//  router.patch('/users/:id', async (req, res) => {
//      const updates = Object.keys(req.body)
//      const allowedUpdates = ['name', 'age', 'email', 'password']
//      const isValidOperation  = updates.every( (update) => allowedUpdates.includes(update))
 
//      if (!isValidOperation) {
//          return res.status(404).send()
//      }
 
//      try {

//         const user = await User.findById(req.params.id)
//         updates.forEach((update) => {
//             user[update] = req.body[update]
//         })
//         await user.save()
//          //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true})
 
//          if (!user) {
//              return res.status(404).send()
//          }
//          res.send(user)
//      } catch (e) {
//          res.status(400).send(e)
//      }
//  })

 //update user after auth
 router.patch('/users/me', auth ,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation  = updates.every( (update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(404).send()
    }

    try {

       const user = req.user
       updates.forEach((update) => {
           user[update] = req.body[update]
       })
       await user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true})

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})
 

 //delete user
 //router.delete('/users/:id', auth ,async (req, res) => {
 router.delete('/users/me', auth ,async (req, res) => {
     try {
         //old code without auth
        //  const user = await User.findByIdAndDelete(req.params.id)
        //  if(!user) {
        //      return res.status(404).send()
        //  }
         await req.user.remove()
         res.send(req.user)
     } catch (e) {
         res.status(500).send()
     }
 })

 const upload = multer({
     //dest:'avatar',
     limits: {
         fileSize : 1000000 //in bytes
     },
     fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image.'))
        }
        cb(undefined, true)
     }
 })

 //upload image
 router.post('/users/me/avatar', auth ,upload.single('avatar') , async (req, res) => {
     req.user.avatar = req.file.buffer
     await req.user.save()
    res.send()
 }, (error, req, res, next) => {
    res.status(400).send({ error : error.message})
 })

 //delete image
 router.delete('/users/me/avatar', auth, async (req, res) => {
     req.user.avatar = undefined
     await req.user.save()
     res.send()
 }) 

 //get image 
 router.get('/users/:id/avatar', async (req, res) => {
     try {
        const user =  await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('content-type', 'image/jpg')
        res.send(user.avatar)
     }catch(e) {
        res.status(404).send()
     }
 })
 
 module.exports = router
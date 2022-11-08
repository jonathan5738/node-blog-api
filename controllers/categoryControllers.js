const Category = require('../models/category') 
const createCategory = async (req, res, next) => {
    const {name} = req.body
    try{
        const category = await Category.create({name})
        return res.status(201).send(category)
    } catch(err){
        return res.status(400).send({ error: err.message })
    }
}

const listCategory = async (req, res, next) => {
    try{
        const categories = await Category.find({})
        return res.status(200).send(categories)
    } catch (err){
        return res.status(400).send({ error: err.message })
    }
}
 
const editCategory = async (req, res, next) => {
    const {category_id} = req.params
    const {name} = req.body 
    try{
        const category = await Category.findByIdAndUpdate({_id: category_id}, {name}, {new: true})
        return res.status(200).send(category)
    } catch(err){
        return res.status(500).send({ error: err.message })
    }
}
const deleteCategory = async (req, res, next) => {
    const {category_id} = req.params 
    try{
        await Category.findByIdAndDelete({_id: category_id})
        return res.status(200).send({})
    } catch(err){
        return res.status(500).send({error: err.message })
    }
}
module.exports = { createCategory, listCategory, editCategory, deleteCategory }
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const titles = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelpcamp');

	
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
	console.log ("Database connected");
});
	

const sample = (arr) => arr[Math.floor(Math.random()*arr.length)];

const seedDB = async() =>{
	await Campground.deleteMany({});

	for(let i=0;i<50;++i){
		const random1000 = Math.floor(Math.random()*1000+1);
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			price: Math.floor(Math.random()*30+10),
			title: `${sample(titles.descriptors)} ${sample(titles.places)}`,
			image: `https://picsum.photos/400?random=${Math.random()}`,
			author: '6859d0350ee40aff5991a735',
			description: `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laudantium, fugit inventore facere quod eveniet, sequi dignissimos sit, iusto deleniti eligendi distinctio error praesentium a alias amet suscipit fuga, assumenda non.`
		})
		await camp.save();
	}
}

seedDB().then(()=>{
	console.log('Seeded!! Closing Connection now');
	mongoose.connection.close();
})
	
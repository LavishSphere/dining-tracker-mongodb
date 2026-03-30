const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const db = client.db("nutrition_tracker_db");

db.collection("menu_items").find({
  $or: [
    { "category": "Vegan" },
    { "allergen_tags": { $regex: "Gluten", $options: "i" } }
  ]
});

db.collection("users").aggregate([
  { $match: { "email": "khayrul.a@northeastern.edu" } },
  { $project: { "entry_count": { $size: "$consumption_entries" } } }
]);

db.collection("dining_locations").updateOne(
  { "name": "Founders Commons" },
  { $set: { "is_active": false } }
);

db.collection("users").aggregate([
  { $unwind: "$dietary_goals" },
  { $group: { _id: "$display_name", max_goal: { $max: "$dietary_goals.target_value" } } }
]);

db.collection("dining_locations").find(
  { "campus": "Oakland" },
  { projection: { "name": 1, "_id": 0 } }
);
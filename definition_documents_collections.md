# Document Database Model: Nutrition Tracker (MongoDB)

This file describes the main document `Collections` and sample JSON objects for the Project 2 MongoDB adaptation (`nutrition_tracker_db`).

## 1) Main Collections

- `users`
- `menu_items`
- `dining_locations`
- `menu_snapshots`

These are root collections in the hierarchical model.

---

## 2) `users` Collection (root document)

- stores user profiles, goals, saved filters, meal plans, consumption entries
- uses embedded arrays for related hierarchical data

### Sample document

```json
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90123"},
  "email": "khayrul.a@northeastern.edu",
  "display_name": "Ashsmith Khayrul",
  "created_at": {"$date": "2026-03-28T12:00:00Z"},

  "dietary_goals": [
    {"goal_id": "g_001", "goal_type": "Daily Calorie Limit", "target_value": 2500, "unit": "kcal"},
    {"goal_id": "g_002", "goal_type": "Protein Target", "target_value": 150, "unit": "g"}
  ],

  "filter_presets": [
    {"preset_id": "fp_01", "name": "Low Carb", "max_calories": 500}
  ],

  "meal_plans": [
    {
      "plan_id": "mp_555",
      "plan_date": "2026-03-29",
      "planned_items": [
        {"menu_item_id": {"$oid": "65f1a2b3c4d5e6f7a8b90456"}}
      ]
    }
  ],

  "consumption_entries": [
    {
      "entry_id": "ce_99",
      "consumed_at": {"$date": "2026-03-28T13:15:00Z"},
      "offering_id": "off_202"
    }
  ]
}
```

> Notes:
> - `menu_item_id` is a reference to `menu_items._id`.
> - `offering_id` references menu snapshot offering entry in `menu_snapshots.offerings`.

---

## 3) `menu_items` Collection (root document)

- stores master list of food items
- includes embedded nutrition history to support versioned values

### Sample document

```json
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90456"},
  "name": "Grilled Chicken",
  "category": "Main Course",
  "allergen_tags": "None",

  "nutrition_history": [
    {"version_id": "v_01", "calories": 180, "serving_size": "4oz", "recorded_at": {"$date": "2026-01-01T00:00:00Z"}},
    {"version_id": "v_02", "calories": 165, "serving_size": "4oz", "recorded_at": {"$date": "2026-03-01T00:00:00Z"}}
  ]
}
```

---

## 4) `dining_locations` Collection (root document)

- stores facilities for food service
- embedded `meal_periods` for hierarchical schedule data

### Sample document

```json
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90999"},
  "name": "Founders Commons",
  "campus": "Oakland",
  "is_active": true,

  "meal_periods": [
    {"period_id": "p_lunch", "name": "Lunch", "start_time": "11:00", "end_time": "14:30"},
    {"period_id": "p_dinner", "name": "Dinner", "start_time": "17:00", "end_time": "20:00"}
  ]
}
```

---

## 5) `menu_snapshots` Collection (root document)

- stores daily menu state for a location + meal period
- contains embedded `offerings` array which references `menu_items`

### Sample document

```json
{
  "_id": {"$oid": "65f1a2b3c4d5e6f7a8b90789"},
  "menu_date": {"$date": "2026-03-28T00:00:00Z"},
  "location_id": {"$oid": "65f1a2b3c4d5e6f7a8b90999"},
  "meal_period_id": "p_lunch",

  "offerings": [
    {
      "offering_id": "off_202",
      "station": "The Grill",
      "menu_item_id": {"$oid": "65f1a2b3c4d5e6f7a8b90456"},
      "nutrition_version_id": "v_02"
    }
  ]
}
```

---

## 6) How this helps another DB engineer

1. Clear root collections and embedded document structure.
2. ObjectId foreign-key references are provided in fields (`location_id`, `menu_item_id`).
3. Hierarchical modeling shown as embedded arrays (`dietary_goals`, `meal_periods`, `offerings`).
4. This is a canonical doc-based model ready to load with `mongoimport`.

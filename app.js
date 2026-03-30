const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const databaseName = process.env.MONGO_DB || 'nutrition_tracker_db';

app.use(express.urlencoded({ extended: true }));

let client;
let dbPromise;

function getDb() {
  if (!dbPromise) {
    client = new MongoClient(mongoUrl);
    dbPromise = client.connect().then(() => client.db(databaseName));
  }
  return dbPromise;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function pageShell(title, content) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)} — Campus Nutrition</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          :root {
            --brand: #6366f1;
            --brand-dark: #4f46e5;
            --brand-light: #eef2ff;
            --danger: #ef4444;
            --danger-dark: #dc2626;
            --success: #10b981;
            --bg: #f8fafc;
            --surface: #ffffff;
            --border: #e2e8f0;
            --text: #0f172a;
            --muted: #64748b;
            --radius: 12px;
          }
          body {
            font-family: 'Inter', system-ui, sans-serif;
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-size: 14px;
            line-height: 1.6;
          }
          /* ── Top bar ── */
          .topbar {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 0 32px;
            display: flex;
            align-items: center;
            gap: 32px;
            height: 58px;
            box-shadow: 0 2px 12px rgba(79,70,229,.35);
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .topbar-brand {
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: -.3px;
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            white-space: nowrap;
          }
          .topbar-brand svg { flex-shrink: 0; }
          .topbar-nav {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
          }
          .topbar-nav a {
            color: rgba(255,255,255,.75);
            text-decoration: none;
            padding: 6px 14px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 13px;
            transition: background .15s, color .15s;
          }
          .topbar-nav a:hover {
            background: rgba(255,255,255,.15);
            color: #fff;
          }
          .topbar-nav a.active {
            background: rgba(255,255,255,.2);
            color: #fff;
          }
          /* ── Page layout ── */
          .wrap {
            max-width: 1100px;
            margin: 0 auto;
            padding: 36px 24px 64px;
          }
          .page-header {
            margin-bottom: 24px;
          }
          .page-header h1 {
            margin: 0 0 4px;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -.4px;
          }
          .page-header p {
            margin: 0;
            color: var(--muted);
          }
          /* ── Cards ── */
          .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 1px 4px rgba(0,0,0,.05);
          }
          .card h2 { margin: 0 0 8px; font-size: 15px; font-weight: 600; }
          .card p  { margin: 0 0 12px; color: var(--muted); }
          .grid.two {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
          }
          /* ── Stat cards ── */
          .stat-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 1px 4px rgba(0,0,0,.05);
            transition: box-shadow .2s;
          }
          .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
          .stat-icon {
            width: 48px; height: 48px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 22px; flex-shrink: 0;
          }
          .stat-icon.purple { background: #ede9fe; }
          .stat-icon.green  { background: #d1fae5; }
          .stat-icon.blue   { background: #dbeafe; }
          .stat-icon.orange { background: #ffedd5; }
          .stat-label { font-size: 12px; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: .5px; }
          .stat-value { font-size: 24px; font-weight: 700; letter-spacing: -.5px; margin-top: 2px; }
          /* ── Table ── */
          .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
          thead th {
            color: #fff;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .6px;
            padding: 13px 16px;
            text-align: left;
          }
          tbody tr { transition: background .12s; }
          tbody tr:nth-child(even) { background: #fafbff; }
          tbody tr:hover { background: #f0f4ff; }
          td {
            padding: 13px 16px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
            color: var(--text);
          }
          tbody tr:last-child td { border-bottom: 0; }
          /* ── Badges ── */
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            margin: 2px;
          }
          .badge-purple { background: #ede9fe; color: #6d28d9; }
          .badge-green  { background: #d1fae5; color: #065f46; }
          .badge-orange { background: #ffedd5; color: #9a3412; }
          .badge-red    { background: #fee2e2; color: #991b1b; }
          .badge-gray   { background: #f1f5f9; color: #475569; }
          /* ── Buttons ── */
          .btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 16px;
            border: none; border-radius: 8px;
            font: 600 13px 'Inter', sans-serif;
            cursor: pointer;
            text-decoration: none;
            transition: filter .15s, transform .1s;
            white-space: nowrap;
          }
          .btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
          .btn:active { transform: translateY(0); filter: brightness(.96); }
          .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 2px 8px rgba(99,102,241,.35); }
          .btn-secondary { background: #f1f5f9; color: #334155; }
          .btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,.25); }
          .btn-sm { padding: 5px 10px; font-size: 12px; }
          .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
          /* ── Toolbar (above table) ── */
          .toolbar {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
          }
          /* ── Form ── */
          .form-grid { display: grid; gap: 16px; }
          .form-grid.two { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
          label { display: grid; gap: 6px; font-weight: 600; font-size: 13px; color: #334155; }
          input, select, textarea {
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            font: 14px 'Inter', sans-serif;
            color: var(--text);
            background: var(--surface);
            transition: border-color .15s, box-shadow .15s;
            width: 100%;
          }
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--brand);
            box-shadow: 0 0 0 3px rgba(99,102,241,.15);
          }
          .form-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
          /* ── Misc ── */
          .muted { color: var(--muted); }
          a { color: var(--brand); text-decoration: none; }
          a:hover { text-decoration: underline; }
          .empty-state {
            text-align: center; padding: 48px 24px; color: var(--muted);
          }
          .empty-state .icon { font-size: 40px; margin-bottom: 12px; }
          .divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
        </style>
      </head>
      <body>
        ${navBar(title)}
        <div class="wrap">
          ${content}
        </div>
      </body>
    </html>
  `;
}

function navBar(activeTitle) {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/users', label: 'Users' },
    { href: '/menu-items', label: 'Menu Items' },
  ];
  const items = links.map(l => {
    const active = activeTitle && activeTitle.toLowerCase().includes(l.label.toLowerCase()) ? ' active' : '';
    return `<a href="${l.href}" class="${active}">${l.label}</a>`;
  }).join('');
  return `
    <nav class="topbar">
      <a href="/" class="topbar-brand">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect width="26" height="26" rx="7" fill="rgba(255,255,255,.2)"/>
          <text x="5" y="19" font-size="15" font-family="serif">🥗</text>
        </svg>
        Campus Nutrition
      </a>
      <div class="topbar-nav">${items}</div>
    </nav>
  `;
}

function homePage() {
  return pageShell('Home', `
    <div class="page-header">
      <h1>Campus Nutrition Management</h1>
      <p>Manage users, menu items, and nutritional data for dining locations.</p>
    </div>
    <div class="grid two" style="margin-bottom:24px;">
      <a href="/users" style="text-decoration:none;">
        <div class="stat-card">
          <div class="stat-icon purple">👤</div>
          <div>
            <div class="stat-label">Module</div>
            <div class="stat-value" style="font-size:18px;">Users</div>
            <div class="muted" style="font-size:12px;margin-top:2px;">Create &amp; manage accounts</div>
          </div>
        </div>
      </a>
      <a href="/menu-items" style="text-decoration:none;">
        <div class="stat-card">
          <div class="stat-icon green">🥗</div>
          <div>
            <div class="stat-label">Module</div>
            <div class="stat-value" style="font-size:18px;">Menu Items</div>
            <div class="muted" style="font-size:12px;margin-top:2px;">Track nutrition &amp; allergens</div>
          </div>
        </div>
      </a>
    </div>
    <div class="card" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;">
      <div style="font-weight:700;font-size:15px;margin-bottom:4px;">Getting Started</div>
      <div style="opacity:.85;font-size:13px;">Add users, then create menu items with nutritional info. Each edit appends a new nutrition history entry so changes are fully auditable.</div>
    </div>
  `);
}

function renderUsersList(users) {
  const rows = users.map((user) => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">
            ${escapeHtml((user.display_name || '?')[0].toUpperCase())}
          </div>
          <span style="font-weight:500;">${escapeHtml(user.display_name || '')}</span>
        </div>
      </td>
      <td class="muted">${escapeHtml(user.email || '')}</td>
      <td class="muted" style="font-size:12px;">${escapeHtml(user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '')}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <a href="/users/${user._id}/edit" class="btn btn-sm btn-outline">Edit</a>
          <form method="post" action="/users/${user._id}/delete" onsubmit="return confirm('Delete ${escapeHtml(user.display_name || 'this user')}?');" style="display:inline;">
            <button class="btn btn-sm btn-danger" type="submit">Delete</button>
          </form>
        </div>
      </td>
    </tr>
  `).join('');

  const emptyState = `
    <tr><td colspan="4">
      <div class="empty-state">
        <div class="icon">👤</div>
        <div style="font-weight:600;margin-bottom:4px;">No users yet</div>
        <div style="font-size:13px;">Create your first user to get started.</div>
      </div>
    </td></tr>`;

  return pageShell('Users', `
    <div class="page-header">
      <h1>Users</h1>
      <p>Manage registered user accounts.</p>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="toolbar" style="padding:16px 20px;">
        <span style="font-weight:600;font-size:14px;">${users.length} user${users.length !== 1 ? 's' : ''}</span>
        <a href="/users/new" class="btn btn-primary">+ New User</a>
      </div>
      <div class="table-wrap" style="border-radius:0;border-left:0;border-right:0;border-bottom:0;">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows || emptyState}
          </tbody>
        </table>
      </div>
    </div>
  `);
}

function userForm(action, user = {}) {
  const isEdit = Boolean(user._id);
  return pageShell(isEdit ? 'Edit User' : 'New User', `
    <div class="page-header">
      <h1>${isEdit ? 'Edit User' : 'New User'}</h1>
      <p><a href="/users">&larr; Back to Users</a></p>
    </div>
    <div class="card" style="max-width:540px;">
      <form method="post" action="${action}" class="form-grid">
        <label>
          Display Name
          <input name="display_name" value="${escapeHtml(user.display_name || '')}" placeholder="e.g. Jane Smith" required />
        </label>
        <label>
          Email
          <input name="email" type="email" value="${escapeHtml(user.email || '')}" placeholder="e.g. jane@northeastern.edu" required />
        </label>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create User'}</button>
          <a href="/users" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `);
}

const ALLERGEN_COLORS = { dairy:'badge-orange', gluten:'badge-red', nuts:'badge-orange', soy:'badge-purple', eggs:'badge-gray', fish:'badge-blue', shellfish:'badge-blue' };

function allergenBadges(tags) {
  if (!tags) return '<span class="muted" style="font-size:12px;">—</span>';
  return String(tags).split(/[,\s]+/).filter(Boolean).map(t => {
    const cls = ALLERGEN_COLORS[t.toLowerCase()] || 'badge-gray';
    return `<span class="badge ${cls}">${escapeHtml(t)}</span>`;
  }).join('');
}

function renderMenuItemsList(items) {
  const rows = items.map((item) => {
    const latest = Array.isArray(item.nutrition_history) && item.nutrition_history.length > 0
      ? item.nutrition_history[item.nutrition_history.length - 1] : null;
    const cal = latest && latest.calories != null ? `<span class="badge badge-green">${escapeHtml(String(latest.calories))} kcal</span>` : '<span class="muted" style="font-size:12px;">—</span>';
    return `
    <tr>
      <td style="font-weight:500;">${escapeHtml(item.name || '')}</td>
      <td><span class="badge badge-purple">${escapeHtml(item.category || '')}</span></td>
      <td>${allergenBadges(item.allergen_tags)}</td>
      <td>${cal}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <a href="/menu-items/${item._id}/edit" class="btn btn-sm btn-outline">Edit</a>
          <form method="post" action="/menu-items/${item._id}/delete" onsubmit="return confirm('Delete ${escapeHtml(item.name || 'this item')}?');" style="display:inline;">
            <button class="btn btn-sm btn-danger" type="submit">Delete</button>
          </form>
        </div>
      </td>
    </tr>`;
  }).join('');

  const emptyState = `
    <tr><td colspan="5">
      <div class="empty-state">
        <div class="icon">🥗</div>
        <div style="font-weight:600;margin-bottom:4px;">No menu items yet</div>
        <div style="font-size:13px;">Add your first item to start tracking nutrition.</div>
      </div>
    </td></tr>`;

  return pageShell('Menu Items', `
    <div class="page-header">
      <h1>Menu Items</h1>
      <p>Browse and manage menu items with nutritional data.</p>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="toolbar" style="padding:16px 20px;">
        <span style="font-weight:600;font-size:14px;">${items.length} item${items.length !== 1 ? 's' : ''}</span>
        <a href="/menu-items/new" class="btn btn-primary">+ New Item</a>
      </div>
      <div class="table-wrap" style="border-radius:0;border-left:0;border-right:0;border-bottom:0;">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Allergens</th>
              <th>Calories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows || emptyState}
          </tbody>
        </table>
      </div>
    </div>
  `);
}

function menuItemForm(action, item = {}) {
  const isEdit = Boolean(item._id);
  const latestNutrition = Array.isArray(item.nutrition_history) && item.nutrition_history.length > 0
    ? item.nutrition_history[item.nutrition_history.length - 1]
    : {};

  return pageShell(isEdit ? 'Edit Menu Item' : 'New Menu Item', `
    <div class="page-header">
      <h1>${isEdit ? 'Edit Menu Item' : 'New Menu Item'}</h1>
      <p><a href="/menu-items">&larr; Back to Menu Items</a></p>
    </div>
    <div class="card" style="max-width:600px;">
      <form method="post" action="${action}" class="form-grid">
        <div class="form-grid two">
          <label>
            Name
            <input name="name" value="${escapeHtml(item.name || '')}" placeholder="e.g. Caesar Salad" required />
          </label>
          <label>
            Category
            <input name="category" value="${escapeHtml(item.category || '')}" placeholder="e.g. Salads" required />
          </label>
        </div>
        <label>
          Allergen Tags
          <input name="allergen_tags" value="${escapeHtml(item.allergen_tags || '')}" placeholder="e.g. dairy, gluten, nuts" />
          <span class="muted" style="font-weight:400;font-size:12px;">Comma-separated list of allergens</span>
        </label>
        <hr class="divider" style="margin:4px 0;" />
        <div style="font-weight:600;font-size:13px;color:#334155;">Nutrition${isEdit ? ' <span style="font-weight:400;color:var(--muted)">(appends new history entry)</span>' : ''}</div>
        <div class="form-grid two">
          <label>
            Calories
            <input name="calories" type="number" min="0" value="${escapeHtml(String(latestNutrition.calories ?? ''))}" placeholder="e.g. 350" />
          </label>
          <label>
            Serving Size
            <input name="serving_size" value="${escapeHtml(latestNutrition.serving_size || '')}" placeholder="e.g. 1 cup (240g)" />
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Item'}</button>
          <a href="/menu-items" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `);
}

app.get('/', (req, res) => {
  res.send(homePage());
});

app.get('/users', async (req, res, next) => {
  try {
    const db = await getDb();
    const users = await db.collection('users').find({}).sort({ created_at: -1 }).toArray();
    res.send(renderUsersList(users));
  } catch (error) {
    next(error);
  }
});

app.get('/users/new', (req, res) => {
  res.send(userForm('/users'));
});

app.post('/users', async (req, res, next) => {
  try {
    const db = await getDb();
    await db.collection('users').insertOne({
      email: req.body.email,
      display_name: req.body.display_name,
      created_at: new Date(),
      dietary_goals: [],
      filter_presets: [],
      meal_plans: [],
      consumption_entries: []
    });
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
});

app.get('/users/:id/edit', async (req, res, next) => {
  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return res.status(404).send(pageShell('Not Found', `<div class="card"><h1>User not found</h1><a href="/users" class="btn btn-secondary" style="margin-top:12px;">Back to Users</a></div>`));
    }
    res.send(userForm(`/users/${user._id}`, user));
  } catch (error) {
    next(error);
  }
});

app.post('/users/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          email: req.body.email,
          display_name: req.body.display_name
        }
      }
    );
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
});

app.post('/users/:id/delete', async (req, res, next) => {
  try {
    const db = await getDb();
    await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect('/users');
  } catch (error) {
    next(error);
  }
});

app.get('/menu-items', async (req, res, next) => {
  try {
    const db = await getDb();
    const items = await db.collection('menu_items').find({}).sort({ name: 1 }).toArray();
    res.send(renderMenuItemsList(items));
  } catch (error) {
    next(error);
  }
});

app.get('/menu-items/new', (req, res) => {
  res.send(menuItemForm('/menu-items'));
});

app.post('/menu-items', async (req, res, next) => {
  try {
    const db = await getDb();
    const calories = req.body.calories ? Number(req.body.calories) : null;
    const nutritionHistory = [];

    if (calories !== null || req.body.serving_size) {
      nutritionHistory.push({
        version_id: `v_${Date.now()}`,
        calories,
        serving_size: req.body.serving_size || '',
        recorded_at: new Date()
      });
    }

    await db.collection('menu_items').insertOne({
      name: req.body.name,
      category: req.body.category,
      allergen_tags: req.body.allergen_tags,
      nutrition_history: nutritionHistory
    });

    res.redirect('/menu-items');
  } catch (error) {
    next(error);
  }
});

app.get('/menu-items/:id/edit', async (req, res, next) => {
  try {
    const db = await getDb();
    const item = await db.collection('menu_items').findOne({ _id: new ObjectId(req.params.id) });
    if (!item) {
      return res.status(404).send(pageShell('Not Found', `<div class="card"><h1>Menu item not found</h1><a href="/menu-items" class="btn btn-secondary" style="margin-top:12px;">Back to Menu Items</a></div>`));
    }
    res.send(menuItemForm(`/menu-items/${item._id}`, item));
  } catch (error) {
    next(error);
  }
});

app.post('/menu-items/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    const calories = req.body.calories ? Number(req.body.calories) : null;
    const nutritionHistoryEntry = calories !== null || req.body.serving_size
      ? {
          version_id: `v_${Date.now()}`,
          calories,
          serving_size: req.body.serving_size || '',
          recorded_at: new Date()
        }
      : null;

    const update = {
      name: req.body.name,
      category: req.body.category,
      allergen_tags: req.body.allergen_tags
    };

    if (nutritionHistoryEntry) {
      update.$push = { nutrition_history: nutritionHistoryEntry };
    }

    const updateDoc = nutritionHistoryEntry
      ? { $set: { name: update.name, category: update.category, allergen_tags: update.allergen_tags }, $push: update.$push }
      : { $set: update };

    await db.collection('menu_items').updateOne(
      { _id: new ObjectId(req.params.id) },
      updateDoc
    );

    res.redirect('/menu-items');
  } catch (error) {
    next(error);
  }
});

app.post('/menu-items/:id/delete', async (req, res, next) => {
  try {
    const db = await getDb();
    await db.collection('menu_items').deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect('/menu-items');
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).send(pageShell('Not Found', `<div class="card"><h1>404 — Page not found</h1><p class="muted">The page you're looking for doesn't exist.</p><a href="/" class="btn btn-primary" style="margin-top:8px;">Go Home</a></div>`));
});

app.use((error, _req, res, _next) => {
  res.status(500).send(pageShell('Server Error', `<div class="card"><h1>Server Error</h1><pre style="background:#f8fafc;padding:16px;border-radius:8px;overflow:auto;font-size:12px;">${escapeHtml(error.stack || error.message)}</pre></div>`));
});

app.listen(port, () => {
  console.log(`Dining tracker app running on http://localhost:${port}`);
});

// Parts of this codebase were inspired by or adapted from the following sources:
// - Claude Code
// - GitHub Copilot

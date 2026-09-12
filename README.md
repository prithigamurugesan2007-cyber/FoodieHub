# FoodieHub — Single Page Application

FoodieHub is a frontend-only restaurant discovery SPA built for the Week 5 SPA Simulation task.

## Technologies
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- LocalStorage
- History API
- Responsive design

## Features
- Login/Register-style frontend screen
- LocalStorage-based session
- Home dashboard
- Restaurant listing
- Search and category filtering
- Restaurant details and menu
- Favorites stored in LocalStorage
- Profile page
- About page
- Client-side routing
- Browser Back/Forward support
- Smooth route transitions
- 404 error handling
- Responsive mobile navigation


## Local testing
You can double-click `index.html` and use the application. When opened with `file://`, the router automatically uses hash URLs such as `#/about` so navigation works without a server.

For cloud/static hosting, the app uses normal History API routes such as `/about`. If your host does not support SPA rewrites, enable a rewrite/fallback from unknown routes to `index.html`, or use the local hash fallback.



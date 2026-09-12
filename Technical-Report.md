# Technical Report — FoodieHub SPA

## 1. Project Objective

FoodieHub is a small-scale Single Page Application created for the Week 5 SPA Simulation task. The application demonstrates dynamic content loading, client-side routing, URL changes, browser navigation, transitions, local state management and responsive frontend design without a backend.

## 2. Project Plan

The project was divided into four stages:

1. **Structure** — create one HTML app shell with a navigation bar, dynamic `<main id="app">` container and reusable `<template>` views.
2. **Styling** — build a responsive restaurant-discovery interface with cards, food imagery, buttons, mobile navigation and smooth transitions.
3. **Functionality** — implement client-side routing, restaurant search/filtering, favorites, login state and profile information with vanilla JavaScript.
4. **Testing & polish** — test navigation, refreshes, Back/Forward behavior, favorites, login validation, 404 handling and responsive layouts.

## 3. Architecture

### 3.1 Single HTML shell

`index.html` is the main container. Different views are stored in HTML `<template>` elements and inserted into `#app` when a route is selected.

### 3.2 Client-side routing

The JavaScript router maps routes including:

- `/`
- `/restaurants`
- `/categories`
- `/favorites`
- `/profile`
- `/about`
- `/restaurant/:id`

`history.pushState()` changes the URL without requesting a new HTML document. `popstate` handles browser Back/Forward navigation.

### 3.3 LocalStorage

Because this sprint does not require a backend, LocalStorage is used for:

- Demo login/session state
- Favorite restaurant IDs

This is suitable for a frontend demonstration but is not secure authentication.

### 3.4 Local file support

When the project is opened directly with `file://`, clean History API paths cannot reliably be created by every browser. FoodieHub therefore uses hash URLs such as `#/about` for local previews. On HTTP/static hosting it uses normal SPA paths such as `/about`.

## 4. Main Features

### Login
The user enters a name, email and demo password. Valid data is stored locally and the main application is displayed.

### Home
Shows a hero section, popular restaurants and food categories.

### Restaurants
Shows restaurant cards with search and category filters.

### Restaurant details
Each restaurant has a dynamic detail route containing image, rating, delivery time, price and sample menu items.

### Favorites
Users can save or remove restaurants. The favorite count is displayed in the navigation bar.

### Categories
Users can select a food category and dynamically view matching restaurants.

### Profile
Displays the locally stored user name, email and favorite count.

### About
Explains how the SPA works and why LocalStorage is used.

### 404 handling
Unknown routes show a custom 404 page rather than a blank screen.

## 5. Challenges and Solutions

| Challenge | Solution |
|---|---|
| Navigation should not reload the page | Intercept internal links and render views with JavaScript |
| URL must change | Use `history.pushState()` |
| Back/Forward must work | Use the `popstate` event |
| Local `file://` preview can reject clean paths | Use hash routing as a local fallback |
| Login without backend | Store demo session in LocalStorage |
| Favorite state should persist | Store restaurant IDs in LocalStorage |
| Unknown route | Render a custom 404 view |
| Mobile layout | Responsive CSS and hamburger navigation |

## 6. Testing

The following were tested:

- Login form validation
- Navigation between all main views
- Restaurant search
- Category filters
- Favorite add/remove
- Favorite persistence after refresh
- Restaurant detail routes
- Browser Back/Forward
- Unknown URL / 404
- Logout
- Mobile navigation
- Responsive card layouts

## 7. Conclusion

FoodieHub demonstrates the main requirements of a small SPA using only HTML, CSS and JavaScript. The application dynamically changes its content without full page reloads, updates the URL with client-side routing, stores simple state locally, handles errors and provides a polished responsive interface. The project can be deployed to a static hosting service and submitted together with the source ZIP and technical report.

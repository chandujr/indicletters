# Indic Letters - Developer Guide

## Project Overview
Educational web app for learning Indian scripts with interactive alphabet tables and writing practice.

### Current Status
- **Languages**: Tamil, Malayalam, Kannada, Telugu, Marathi, Odia (6 available)
- **Planned**: Bengali, Gujarati, Hindi
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript, PWA

## Project Structure

```
indicletters/
├── assets/          # Images, icons
├── css/             # Stylesheets
├── js/              # JavaScript modules
├── languages/       # JSON language data
├── index.html       # Landing page
├── language.html    # Language template
└── service-worker.js # PWA functionality
```

## Key Development Tasks

### Adding New Language
1. Create `[language].json` in `languages/` directory
2. Add language card to `index.html`
3. Update cache list in `service-worker.js`
4. Add font mapping in `js/writing-pad.js` if needed

### Language Data Structure
```json
{
  "language": "Name",
  "nativeName": "Native Name",
  "script": "Script Name",
  "halant": { "symbol": "SYMBOL", "name": "name" },
  "vowels": [ { "symbol": "S", "transliteration": "t", "diacritic": "d" } ],
  "consonants": [ { "symbol": "S", "base": "b", "hl": 1 (optional) } ]
}
```

### Style Updates
- **Theme variables**: `css/variables.css`
- **Components**: `css/components.css`
- **Layout**: `css/layout.css`
- **Writing pad**: `css/writing-pad.css`

## Important Constraints
- **DO NOT** modify `node_modules` directory
- **DO NOT** modify `sitemap.xml` (auto-generated)
- **DO NOT** read the `LICENSE` file
- **NEVER** commit secrets
- Use **vanilla JavaScript** only

## Coding Standards
- Use ES6+ features
- Follow modular JavaScript patterns
- Use CSS variables for theming
- Implement mobile-first responsive design
- Use semantic HTML5 elements

## PWA Updates
When adding new files:
1. Increment cache version in `service-worker.js`
2. Add new files to cache array
3. Update `manifest.json` if needed
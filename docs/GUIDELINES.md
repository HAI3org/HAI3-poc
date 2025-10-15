# Frameworks
- React is used as the framework
- shadcn/ui is used for UI components
- Tailwind CSS is used for styling

# UI Screensets
- this UI application has several independent screen set variants in src/compoments/screensets
- always develop requested functionality inside your screen set variant, not globaly, if not asked specifically

# UI components
- UIKIT is located in src/components/<screenset>/uikit folder
- Always try to build UI screens using the components from UIKIT
- If there is no suitable component in UIKIT then create a new component in UIKIT, and use it

# UI Styles
- All UI components and screens must support UI themes located in /src/styles/themes
- Always try to use existing styles from UI themes
- If required style is not available in UI themes then create a new style in all UI themes, and use it

# UI screens
- never hardcode screenset name inside screenset screens as it might change
- never hardcode 'if screenset == ' or if 'activeTab == ' in the common shared logic

# UI Content
- when you need simulated page content keep in mind it would extracted by API later
- think about such API design and data structures when you need content
- always put simulated UI content (data) into separate data.ts file near the screen that I can easily edit
- when populating UI screens simulate API layer extracting such content from the that file and put it into api.ts filen


# Special guidelines for Draft screenset
- Draft screenset is located in src/components/screensets/drafts
- Treat mockup as wireframes, not as final pixel-perfect design
- If mockup image had been provided, then treat green stickers on it as description of behaviour, treat yellow sticker as hints for screen elements nearby, treat orange stickers as additional functionality to be added to the screen (not yet illustrated on the mockup)
- If several mockup images had been provided, then treat it as illustration of different states of the same screen
- If new screen was requested, then generate 5 different versions of it, try to make it as different as possible but following requested functionality

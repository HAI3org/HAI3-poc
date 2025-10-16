# Frameworks
- React is used as the framework
- shadcn/ui is used for UI components
- Tailwind CSS is used for styling

# UI Screensets
- This UI application has several independent screen set variants in src/components/screensets
- Always develop requested functionality inside your screen set variant, not globally, if not asked specifically

# UI components
- UIKIT is located in the src/components/<screenset>/uikit folder
- Always try to build UI screens using the components from UIKIT
- If there is no suitable component in UIKIT, then create a new component in UIKIT and use it

# UI Styles
- All UI components and screens must support UI themes located in /src/styles/themes
- Always try to use existing styles from UI themes
- If the required style is not available in UI themes, then create a new style in all UI themes and use it

# UI screens
- Never hardcode the screenset name inside screenset screens, as it might change
- Never hardcode 'if screenset == ' or 'if activeTab == ' in the common shared logic

# UI Content
- When you need simulated page content, keep in mind it will be extracted by the API later
- Think about the API design and data structures when you need content
- Always put simulated UI content (data) into a separate data.ts file near the screen that I can easily edit
- When populating UI screens, simulate the API layer extracting such content from that file and put it into the api.ts file


# Special guidelines for Draft screenset
- The Draft screenset is located in src/components/screensets/drafts
- Treat mockups as wireframes, not as final pixel-perfect designs
- If a mockup image has been provided, treat green stickers on it as descriptions of behavior, treat yellow stickers as hints for nearby screen elements, and treat orange stickers as additional functionality to be added to the screen (not yet illustrated on the mockup)
- If several mockup images have been provided, treat them as illustrations of different states of the same screen
- If a new screen was requested, generate 5 different versions of it; try to make them as different as possible while following the requested functionality

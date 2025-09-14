# JellyAI Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern code editors like VS Code, Linear, and Notion to create a professional developer tool that balances functionality with visual appeal.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary** (default):
- Background: `220 13% 18%` (deep slate)
- Surface: `220 13% 22%` (elevated panels)
- Border: `220 13% 28%` (subtle divisions)
- Text Primary: `210 40% 98%` (high contrast)
- Text Secondary: `215 20% 65%` (muted text)
- Accent Primary: `142 76% 36%` (emerald for AI actions)
- Accent Secondary: `217 91% 60%` (blue for links/info)

**Light Mode**:
- Background: `0 0% 100%` (pure white)
- Surface: `210 20% 98%` (light gray panels)
- Border: `214 32% 91%` (soft borders)
- Text Primary: `222 84% 5%` (near black)
- Text Secondary: `215 16% 47%` (gray text)

### B. Typography
- **Primary Font**: Inter (via Google Fonts CDN)
- **Code Font**: JetBrains Mono (via Google Fonts CDN)
- **Hierarchy**: 
  - Headers: 24px/20px/16px (font-semibold)
  - Body: 14px (font-normal)
  - Code: 13px (font-mono)
  - UI Labels: 12px (font-medium)

### C. Layout System
**Spacing Primitives**: Tailwind units of 1, 2, 4, 6, 8, 12, 16
- Micro spacing: `p-1, m-2` (tight elements)
- Standard spacing: `p-4, gap-4, m-6` (common layouts)
- Section spacing: `p-8, gap-8, m-12` (major divisions)
- Generous spacing: `p-16` (isolated content)

### D. Component Library

**Navigation**:
- Top bar: `h-12` with app logo, user menu, theme toggle
- Side panels: `w-64` collapsible (file tree, git panel)
- Status bar: `h-8` bottom fixed with cursor info, git status

**Editor Area**:
- Tab bar: `h-10` with close buttons and unsaved indicators
- Monaco container: Full remaining viewport with dark theme
- Resizable panels using drag handles with `hover:bg-accent` feedback

**AI Chat Panel**:
- Sliding panel from right: `w-96` with chat history
- Input area with send button and character count
- Message bubbles with user/AI distinction using accent colors
- Code blocks with syntax highlighting and copy buttons

**Forms & Controls**:
- Input fields: `h-9` with focus rings using accent colors
- Buttons: Primary (accent background), Secondary (outline), Ghost (hover only)
- Dropdowns: Consistent with input styling, shadow-lg on open

**Data Displays**:
- File tree: Indent with `ml-4`, icons using Heroicons
- Git diff viewer: Split pane with line numbers, addition/deletion highlighting
- Search results: Highlighted matches with context preview

**Overlays**:
- Modals: Centered with backdrop blur and `shadow-2xl`
- Command palette: Top-center positioned with fuzzy search
- Tooltips: Dark background with white text, subtle shadow

### E. Interaction Patterns

**File Operations**:
- Hover states on file tree items with background color change
- Context menus with right-click actions
- Drag-and-drop visual feedback for file management

**AI Features**:
- Loading states with subtle pulse animation for LLM responses
- Success/error toast notifications positioned top-right
- Progressive disclosure for advanced AI actions

**Git Integration**:
- Staging area with checkboxes and visual diff indicators
- Branch switcher as dropdown with current branch highlighted
- Commit message textarea with character limit feedback

### F. Responsive Behavior
- Desktop-first approach (minimum 1200px width)
- Collapsible panels on smaller screens
- Mobile view shows single panel at a time with tab switching
- Ensure Monaco editor remains usable down to 768px width

### G. Accessibility
- Consistent focus management with visible focus rings
- High contrast mode support
- Keyboard shortcuts for all major actions
- Screen reader friendly labels and ARIA attributes
- Maintain 4.5:1 contrast ratio minimum for all text

This design system creates a professional, developer-focused interface that feels familiar yet modern, with AI capabilities seamlessly integrated into the traditional code editor workflow.
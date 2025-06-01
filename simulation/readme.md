# Bubble Sort SCORM Learning Module

## Overview
This is a comprehensive interactive learning module for the Bubble Sort algorithm, built to be fully SCORM 1.2 compliant. The module provides three different learning modes: Demo, Practice, and Exercise, allowing learners to progress from observation to hands-on implementation.

**Source Acknowledgment**: The original simulation content was copied from the Virtual Labs repository: [https://github.com/virtual-labs/temp-exp-bubble-sort-iiith/tree/main/experiment/bubble-sort/simulation](https://github.com/virtual-labs/temp-exp-bubble-sort-iiith/tree/main/experiment/bubble-sort/simulation). This existing educational content has been enhanced with SCORM 1.2 compliance features for LMS integration.

## SCORM Compliance Changes Made

### 1. SCORM API Integration
- **Added `js/scorm-api.js`**: Complete SCORM 1.2 API wrapper that handles communication with Learning Management Systems (LMS)
- **Functions implemented**:
  - `findAPI()`: Locates the SCORM API in parent windows
  - `getAPI()`: Establishes connection with LMS
  - `initializeSCORM()`: Initializes SCORM communication
  - `setSCORMValue()`: Sets data elements in LMS
  - `getSCORMValue()`: Retrieves data from LMS
  - `commitSCORM()`: Saves data to LMS
  - `finishSCORM()`: Properly terminates SCORM session

### 2. SCORM Manifest File
- **Created `imsmanifest.xml`**: Defines the SCORM package structure
- **Key elements**:
  - Package metadata and SCORM version (1.2)
  - Learning objectives and mastery score (80%)
  - Resource definitions for all HTML, CSS, and JS files
  - SCO (Sharable Content Object) configuration

### 3. Learning Progress Tracking
- **Lesson Status**: Tracks completion states (`incomplete`, `completed`, `passed`)
- **Success Status**: Tracks mastery (`passed`, `failed`, `unknown`)
- **Location Tracking**: Records which page/section learner accessed
- **Score Tracking**: Calculates and stores performance scores

### 4. Intelligent Scoring System
Enhanced the exercise module with sophisticated scoring:

#### Correct Solution (60-100%)
- Base score: 60% for correct sorting
- Efficiency bonus: Up to 40% additional points
- Comparison efficiency: Fewer comparisons = higher score
- Swap efficiency: Fewer unnecessary swaps = higher score
- Pass threshold: 80% for "passed" status

#### Partial Credit (10-40%)
- Progress-based scoring for incorrect solutions
- Measures correctly ordered adjacent pairs
- Minimum 10% for attempting the exercise
- Encourages learning even with incomplete understanding

### 5. Session Management
- **Automatic initialization** on page load
- **Proper termination** on page unload
- **Data persistence** across page navigation
- **Error handling** for LMS communication issues

## SCORM Package Structure and Deployment

### SCORM ZIP Package Requirements
To deploy this simulation in an LMS, it must be packaged as a ZIP file with a specific structure:

#### Required Structure
```
scorm-bubble-sort.zip
├── index.html              # Main entry point (REQUIRED in root)
├── imsmanifest.xml         # SCORM manifest (REQUIRED in root)
├── bsdemo.html             # Demo mode page
├── bspractice.html         # Practice mode page
├── bsexercise.html         # Exercise mode page
├── css/
│   ├── bubble_css.css      # Simulation styles
│   └── main.css            # Additional styles
└── js/
    ├── scorm-api.js        # SCORM API wrapper
    ├── bubble_demo.js      # Demo functionality
    ├── bubble_practice.js  # Practice functionality
    └── bubble_exercise.js  # Exercise with scoring
```

#### Critical Requirements for SCORM ZIP
1. **Flat root structure**: `index.html` and `imsmanifest.xml` must be in the root directory
2. **No nested folders for entry files**: Main HTML files should be accessible from root
3. **All referenced files included**: CSS, JS, images, and other assets must be packaged
4. **Proper manifest references**: All files must be listed in `imsmanifest.xml`
5. **Standard ZIP compression**: Use standard ZIP format (not RAR, 7Z, etc.)

#### Creating the SCORM Package
To create the deployable SCORM package:

1. **Navigate to the simulation folder**:
   ```bash
   cd simulation
   ```

2. **Create ZIP package**:
   ```bash
   zip -r Scorm.zip . -x "*.DS_Store" "readme.md" "*.git*"
   ```

3. **Verify package contents**:
   - Ensure `index.html` is in root when extracted
   - Ensure `imsmanifest.xml` is in root when extracted
   - Verify all CSS/JS files are included in their folders
   - Test extraction to confirm structure

#### Common Packaging Mistakes to Avoid
- **Extra folder nesting**: Don't zip the parent folder, zip the contents
- **Missing manifest**: `imsmanifest.xml` must be present and valid
- **Broken file paths**: Relative paths in HTML must match ZIP structure
- **Large file sizes**: Optimize images and remove unnecessary files
- **Platform-specific files**: Exclude `.DS_Store`, `Thumbs.db`, etc.

### LMS Upload Process
1. **Create ZIP package** from this folder (as described above)
2. **Upload to LMS** using SCORM content upload feature
3. **Configure settings** (mastery score, attempts, etc.)
4. **Test thoroughly** before making available to learners
5. **Monitor tracking data** through LMS reporting tools

### Package Validation
Before uploading to LMS:
- **Extract ZIP** and verify file structure
- **Open index.html** in browser to test functionality
- **Check console** for JavaScript errors
- **Validate manifest** using SCORM validation tools
- **Test on multiple browsers** for compatibility

## How to Use This SCORM Module

### For Learners
1. **Start with Demo**: Understand how Bubble Sort works through automated visualization
2. **Move to Practice**: Interactive mode with guided feedback and no scoring pressure
3. **Complete Exercise**: Hands-on sorting with comprehensive scoring and SCORM tracking

### For Instructors/LMS Administrators
1. **Upload the entire SCORM package** to your LMS
2. **Set mastery score** to 80% (already configured in manifest)
3. **Monitor progress** through LMS reporting features
4. **Review detailed scoring** including efficiency metrics

### LMS Integration
- Compatible with any SCORM 1.2 compliant LMS
- Supports Moodle, Blackboard, Canvas, and other major platforms
- Provides detailed analytics on learner performance
- Tracks time spent and completion status

## Making Other Simulations SCORM Compliant

### Step 1: Add SCORM API Wrapper
Copy `js/scorm-api.js` to your simulation and include it in all HTML files:
```html
<script src="js/scorm-api.js"></script>
```

### Step 2: Create Manifest File
Create `imsmanifest.xml` with these essential elements:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="YourSimulation" version="1.0" 
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="YourOrg">
    <organization identifier="YourOrg">
      <title>Your Simulation Title</title>
      <item identifier="item_main" identifierref="resource_main">
        <title>Your Simulation</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_main" type="webcontent" 
              adlcp:scormtype="sco" href="index.html">
      <!-- List all your files here -->
    </resource>
  </resources>
</manifest>
```

### Step 3: Implement Progress Tracking
Add these essential tracking points:

#### Page Load Tracking
```javascript
window.addEventListener('load', function() {
    initializeSCORM();
    setSCORMValue("cmi.core.lesson_status", "incomplete");
    setSCORMValue("cmi.core.lesson_location", "current_page");
    commitSCORM();
});
```

#### Completion Tracking
```javascript
function completeActivity() {
    setSCORMValue("cmi.core.lesson_status", "completed");
    setSCORMValue("cmi.core.success_status", "passed");
    commitSCORM();
}
```

#### Score Tracking (for assessments)
```javascript
function submitScore(score) {
    setSCORMValue("cmi.core.score.raw", score.toString());
    setSCORMValue("cmi.core.lesson_status", score >= 80 ? "passed" : "completed");
    commitSCORM();
}
```

### Step 4: Session Cleanup
```javascript
window.addEventListener('beforeunload', function() {
    finishSCORM();
});
```

## SCORM Features and Benefits

### 1. Standardized Communication
- **Cross-platform compatibility**: Works with any SCORM-compliant LMS
- **Vendor independence**: Not locked to specific LMS providers
- **Consistent behavior**: Same experience across different platforms

### 2. Comprehensive Tracking
- **Learning progress**: Track completion status and time spent
- **Assessment scores**: Record detailed performance metrics
- **Learning paths**: Monitor progression through content
- **Retry attempts**: Track multiple attempts and improvement

### 3. Data Elements Available
- **cmi.core.lesson_status**: `incomplete`, `completed`, `passed`, `failed`
- **cmi.core.score.raw**: Numeric score (0-100)
- **cmi.core.lesson_location**: Current position in content
- **cmi.core.session_time**: Time spent in current session
- **cmi.core.total_time**: Cumulative time across all sessions
- **cmi.interactions**: Detailed interaction tracking

### 4. Advanced Features
- **Bookmarking**: Resume from where learner left off
- **Adaptive content**: Adjust based on learner performance
- **Prerequisite management**: Control access to advanced content
- **Detailed analytics**: Rich reporting for instructors

### 5. Quality Assurance
- **Error handling**: Graceful degradation when LMS unavailable
- **Data validation**: Ensures data integrity
- **Session management**: Proper initialization and cleanup
- **Logging**: Comprehensive error tracking and debugging

## Best Practices for SCORM Development

### 1. Design Patterns
- **Progressive enhancement**: Work without SCORM, enhance with it
- **Graceful degradation**: Function even if SCORM fails
- **Atomic operations**: Complete data operations in single commits

### 2. Performance Optimization
- **Minimize API calls**: Batch operations when possible
- **Efficient data storage**: Use appropriate SCORM data elements
- **Session management**: Proper initialization and cleanup

### 3. User Experience
- **Transparent operation**: SCORM should be invisible to learners
- **Reliable feedback**: Always indicate progress and completion
- **Cross-browser compatibility**: Test on multiple platforms

### 4. Testing and Validation
- **SCORM conformance tools**: Use ADL test suites
- **Multiple LMS testing**: Verify compatibility across platforms
- **Edge case handling**: Test network failures and timeouts

## File Structure
```
simulation/
├── index.html              # Main navigation page
├── bsdemo.html             # Demo mode
├── bspractice.html         # Practice mode  
├── bsexercise.html         # Exercise mode
├── imsmanifest.xml         # SCORM manifest
├── css/
│   ├── bubble_css.css      # Simulation styles
│   └── main.css            # Additional styles
├── js/
│   ├── scorm-api.js        # SCORM API wrapper
│   ├── bubble_demo.js      # Demo functionality
│   ├── bubble_practice.js  # Practice functionality
│   └── bubble_exercise.js  # Exercise with scoring
└── readme.md               # This documentation
```

## Technical Requirements
- **SCORM Version**: 1.2 (most widely supported)
- **Browser Support**: Modern browsers with JavaScript enabled
- **LMS Requirements**: Any SCORM 1.2 compliant system
- **File Format**: Standard web technologies (HTML, CSS, JavaScript)

**Note**: The `Scorm.zip` file is created by compressing this entire folder structure, ensuring all files maintain their relative paths and the required SCORM package structure is preserved.

This implementation serves as a template for creating other SCORM-compliant educational simulations while maintaining pedagogical effectiveness and technical standards.

# CS_4460_ATA_Photo_Squad

**Team:** ATA Photo Squad
**Members:** Tyler Parker, Albert Nguyen 

**IMPORTANT NOTE:** Gradescope would not allow us to upload our code OR the video (kept getting "Sever errored out" message, so we will instead provide links to both of these things at the bottom of this README. The code will include all files as well as data and libraries, as described below

**IMPORTANT NOTE:** From Prototype 1 and onward (all implementation), the only 2 members of the group were Tyler Parker and Albert Nguyen


**Specific Instructions:**
- Most of the visualizations are self explanatory and the usage should be evident. Definitely feel free to play around with the Energy Consumption graph because the physics are very fun. The accuracy vs age dartboard graph and the data center map both have hoverable tooltips
- Take note of the Energy consumption graph legend and how the value of the balls updates based on the number of AI images
- For the data center graph, any of the info that looks weird (data center not having a name, etc.) comes from the open source data, not an error in the code. The only free data center data we could find was open source, and while quite helpful, not completely and totally perfect.
- Our linked view is the Google Logo fill linked to the total number of ai images generated visualization
- Our novel/innovative visualizations are the age versus accuracy chart, and the energy consumption chart


**Our code has the following key components:**

**CSS Folder**
- This folder contains both our own CSS code (style.css) and the CSS code taken from the internet for the typewriter effect on our title (typewriter_title_effect.css). The typerwriter_title_effects.css code was taken from the following website: https://prismic.io/blog/css-text-animations and this is also mentioned in a comment in that file

**Data Folder**
- This folder contains all of the cleaned data that we used for the project. This includes data on accuracy for distinguishing AI vs real images for all the age groups, data on the total amount of AI images generated per year, JSON data for generating our map, AI energy consumption data for different household appliances, open source data on data centers across the US, and data for all the different Google search trends
- The cleaned data is transformed in various ways in the files, but this is all the baseline data that we are using for our project

**JS Folder**
- The JS folder contains 5 different JS files for visualizations, 1 file for orchestration, and 1 folder which is a library. The orchestration file is main.js and this controls the generation of all our visualizations. AccuracyAgeChart, DataCenterMapChart, ElectricityComparisonChart, GenerationRateOverTimeChart, and SearchesOverTimeChart are the files for generating each of the visualizations
- matter.js is a library that we downloaded to use in the project. Matter.js is a library that allows for the creation of physics based visualization in Java Script. This is how we created the physics based ball dropping visualization for the energy consumption chart. We left a few comments in the ElectricityComparisonChart file linking some demo sources that we pulled code from to assist with this. It is a super cool library!

**Resources Folder**
- This is the folder that houses all of the images used on the site. Mainly the title screen image, the pngs for the darts, the google logo, and the comparison AI images from 2022 and 2024

**index.html**
- This is our HTML orchestration file that has the structure of the webpage and everything that you would expect


**Important Links**
--------

**Process Book Link:** https://docs.google.com/document/d/1fP990-4jG0nnLLrsavO4OaerHp-4JN_9F7Em2KrNPUM/edit?usp=sharing

**Link to Code (GitHub):** https://github.com/tcparker924/CS_4460_ATA_Photo_Squad

**Link to Code (Google Drive):** https://drive.google.com/drive/folders/1Fzay9rIgnlC5S4lyN01XBPITlr9P5cwk?usp=sharing

**Hosted Website Link:** https://tcparker924.github.io/CS_4460_ATA_Photo_Squad/

**Demo Video Link:** https://drive.google.com/file/d/1vyu_ZcD90SQy-YDk0kU1pjE7n3dgmOnF/view?usp=sharing




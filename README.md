App requests data from Finnkino servers.

The user is able to
- Select a theatre from dropdown list
- See a list of shows happening in the selected theatre today
- Shows have movie name, theatre name and time displayed in the table
- Movies on mouseover display an image
- Shows can be filtered with text search and using "Only future shows" checkbox
- App uses jQuery animation to fade in shows whenever the theatre selection is changed

Known bugs

- During Tuesdays (missing confirmation), Finnkino changes images for their events. During this time if there are missing image tags in their XML API the app may not function properly. In this case, the app displays same-sized image with text "No Image".


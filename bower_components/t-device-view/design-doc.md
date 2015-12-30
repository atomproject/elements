Device view is an element which basically shows the content from any given URL in an iframe which is styled to look like a phone or tablet. It uses [this](http://polymerelements.github.io/app-layout-templates/index.html) external resource. Pending feature implementations on this element include removing the mouse cursor and hover effects and replacing that with something similar to chrome’s device emulator, when the user brings a mouse cursor inside the device view element.

## Data Needed 

**1. URL to display**

* Allows the user to enter/ modify the URL whose content is to be displayed in the device view element.
* Shown as an input field in the data panel.
* Default Value: http://atomproject.github.io/elements/

## Properties Exposed

**1. Orientation**

* Lets the user choose between landscape & portrait orientation.
* Shown as a pill button in the property panel.
* Possible Values: ‘Landscape’, ‘Portrait’.
* Default Value: ‘Portrait’.

**2. Device type**

* Lets the user choose between a tablet & phone view.
* Shown as a pill button in the property panel.
* Possible Values: ‘Tablet’, ‘Phone’.
* Default Value: ‘Phone’.

**3. Style**

* Lets the user choose between a light and dark themed device body.
* Shown as a pill button in the property panel.
* Possible Values: ‘Light’, ‘Dark’.
* Default Value: ‘Light’.

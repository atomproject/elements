
These can be used in navigation menus on websites, toolbar menus in applications or in forms. A few things which one can think about while designing dropdowns are 

### For dropdowns used in forms
* Should the menu automatically dropdown or drop up based on the position on a screen? e.g. if the field is near the bottom of the screen when the user clicks it, or it is the last field in a form.
* Should the position of the dropdown on mobile be like some native implementations where the menu opens in the horizontal and vertical center of the screen? i.e. On mobile, should clicking on the dropdown open a dropdown or a full screen scrollable list? 
* What should be the min and max width of the menu?
* How are sections going to be handled? Just with a divider or with a section header as well?
* Should a limit be imposed on the maximum number of items
* If a scroll bar is to be shown due to large number of items, should it be permanently visible or be visible when the user is sliding the menu
* Autocomplete/ search - If a large number of items are present, should the user be allowed to search through the items by typing
* Have selected item bubble to top?
* Have separator after bubbled item?
* Have selected item in bold?
* Have background color in selected item?
* Positioning - below or over emitting element? if over, then dynamic or aligned to top of emitting element?
* Long text truncation & overflow options

### For toolbar menus in applications
- Having secondary text long with primary text of menu items. Typically used to indicate keyboard shortcuts
- Having icons along with menu items
- Allowing cascading menus, and to a maximum of how many levels


### References
* [Drop-Down Usability: When You Should (and Shouldn't) Use Them](http://baymard.com/blog/drop-down-usability)
* [Should I use a drop-down? Four steps for choosing form elements on the Web](http://baymard.com/blog/drop-down-usability)
* [Redesigning The Country Selector](https://www.smashingmagazine.com/2011/11/redesigning-the-country-selector/)
* [Dropdowns Should be the UI of Last Resort](http://www.lukew.com/ff/entry.asp?1950)
* [Designing Drop-Down Menus: Examples and Best Practices](https://www.smashingmagazine.com/2009/03/designing-drop-down-menus-examples-and-best-practices/)
* [Design Patterns for Mega-Navigation Dropdown Menus](http://webdesignledger.com/design-patterns-mega-nav-dropdown-menus/)


<!-- 
## Data Interface

**1. Label**
* Used to input the label of this form field.
* Shown as an input field in the property panel.
* Default Value: Untitled Dropdown.

**2. Error Message when Empty**
* The message displayed, when a form is submitted with this field left empty. Applies when the field is mandatory.
* Shown as an input field in the property panel.
* Default Value: You missed this. 

**3. Selected Value**
* The value that is captured by this form element, after the user has used it during form submission.
* Shown as a text string in the property panel.
* Default Value:(Blank).

**4. Items**
* The list of text strings that make up the dropdown menu.
* Shown as a data feeder in the property panel.
* Default value: [Item one], [Item two], [Item three]

**5. Default Selection**
* Used to specify the default selection of the dropdown.
* Shown as a text string in the property panel.
* Default Value:(Blank).

## Properties Exposed

**1. Disabled**
* Disables the form element.
* Shown as a checkbox in the property panel.
* Default Value: Unchecked.
 
**2. Mandatory**
* Designates the field as mandatory in a form.
* Shown as a checkbox in the property panel.
* Default Value: Unchecked.

**3. Label Float**
* Configures whether the label of this form field lies within the field or floats outside it.
* Shown as a checkbox in the property panel.
* Default Value: Checked.
-->

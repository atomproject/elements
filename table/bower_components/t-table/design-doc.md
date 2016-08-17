A table is an element used to display entries of structured data arranged in rows and columns. It is similar to the list in many of the functions it performs. The table can be populated with data in 4 ways — using an Excel Sheet, Google Sheet, Custom data entered by the user, or via an API based data source. Table includes the following functionality:

* Searching
* Sorting (a separate component manages this)
* Pagination

There are some features which have not yet been implemented:

* Filtering (a separate component manages this)
* Adding new items & deleting existing items
* Multi-select operations
* Infinite Scroll
* Reordering of items
* Accommodating a details pane

### Data Needed 

**1. Choice of data source**

* Lets the user choose from where to get data to populate the table.
* Shown as a pill button in the property panel.
* Possible Values: ‘Excel’, ‘GSheet’, ‘Custom’, ‘API’.
* Default Value: ‘GSheet’.

### Properties Exposed 

**1. Sortable**

* Enables the sorting functionality & displays relevant controls in the list. The ‘Different header row’ property must be enabled for sorting controls to be visible.
* Shown as a checkbox in the property panel.
* Default Value: Checked.

**2. Searchable**

* Enables the search functionality & displays relevant controls in the list.
* Shown as a checkbox in the property panel.
* Default Value: Checked.

**3. Different header row**

* Displays a strip of colour in the first row. This property must be enabled for sorting controls to be visible.
* Shown as a checkbox in the property panel.
* Default Value: Checked.

**4. Banded rows**

* Changes the background colour of alternate rows so that rows of the table appear as bands.
* Shown as a checkbox in the property panel.
* Default Value: Checked.

**5. Hoverable rows**

* Changes the colour of the row over which the user currently has a mouse hover.
* Shown as a checkbox in the property panel.
* Default Value: Checked.

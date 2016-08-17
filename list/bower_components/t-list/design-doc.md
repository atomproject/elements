## Filter
The filter is a component used by the list and table components to allow users to narrow down the data based on certain criteria. Some design considerations for the filter are as follows:

* **Autogeneration** - In case the list or table is API based, the filter is auto-generated. Based on the data-type of the attribute to be filtered, a relevant UI control is used to display its filter. The following types are supported - 

  * `Enum` - Checkbox List
  * `Number` - Range
  * `String` - Search Box
  * ? - Star Rating

* **Workflow** 
  * A strip is visible over the list if filtering is enabled. It shows an icon to open the filters, the number of results, and the search box (if text based filtering is present).
  * Clicking on the filter icon opens the filters in a modal.
  * Interacting with any filter creates a yellow strip which mentions the filter criteria.
  * The filters don't auto-apply. The user needs to explicitly press an apply filters button.
  * The various filters are not interdependent; i.e. enabling some filters doesn't disable others.

* **Search** 
  * Currently searching is allowed only on a single parameter/ attribute.
  * The list of items changes dynamically as the user types into the search box.
  * The count of number of items which match the entered string are displayed on the right of the search box when it is open.

* Items not yet implemented
  * Enum radio list filter
  * Multiple parameter search
  * Horizontal view (for use in certain desktop contexts)
  * Sections (to help categorize the various filters)

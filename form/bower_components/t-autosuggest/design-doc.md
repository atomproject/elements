`Note: This is a work in progress.`

The autosuggest is a form element used to offer suggestions to the user, as text is being entered into the field. This implementation is based on (?) plugin. The set of options used to generate the autosuggestion can be coming from a static list or an API.

## Data Interface

**1. Label**
* Used to input the label of this form field.
* Shown as an input field in the property panel.
* Default Value: Untitled Autosuggest.

**2. Error Message when Empty**
* The message displayed, when a form is submitted with this field left empty. Applies when the field is mandatory.
* Shown as an input field in the property panel.
* Default Value: You missed this. 

**3. Error Message when Incorrect**
* The message to be displayed, when a form is submitted with this field containing a value that is not permitted.
* Shown as an input field in the property panel.
* Default Value: (?).

**4. Selected Value**
* The value that is captured by this form element, after the user has used it during form submission.
* Shown as a text string in the property panel.
* Default Value:(Blank).

**5. No Results Message**
* The message to be displayed to the user if no results are found for the string he has entered.
* Shown as an input field in the property panel.
* Default Value: No matches found.

**6. Selected Item**
* The item that has been selected by the user, after the user has used the autosuggest during form submission.
* Shown as a text string in the property panel.
* Default Value:(Blank).

**7. Data Source URL**
* The URL of the API where the list of items to suggest from are present.
* Shown as an input field in the property panel.
* Default Value: (?).

**8. Field**
* The field in an object which contains the value of interest. This is relevant when the autosuggest API returns a series of objects.
* Shown as an input field in the property panel.
* Default Value: (?).

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

**4. Trigger at**
* Defines the number of characters that need to be entered before the autosuggest will trigger.
* Shown as an input field in the property panel.
* Possible range of values: (?)
* Default Value: 3.

## Some usability references
* [Redesigning The Country Selector](http://www.smashingmagazine.com/2011/11/redesigning-the-country-selector/)
* [8 Design Patterns for Autocomplete Suggestions](http://baymard.com/blog/autocomplete-design)

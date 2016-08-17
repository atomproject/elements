This is a UI control that is designed for the various contexts in which people select dates when interacting with applications. Some of the common contexts are

* Booking (a flight, hotel etc.)
* Birthday (specifying a date of birth)
* BI Report (specifying a range for which the user desires to view records)

Broadly, these distill into reusable patterns for a calendar control. Hence, this control allows selection of a

* Date (close to today)
* Date (at any point in time)
* Range

## Data Interface

**1. Label**
* Used to input the label of this form field.
* Shown as an input field in the property panel.
* Default Value: Select date.

**2. Error Message when Empty**
* The message displayed, when a form is submitted with this field left empty. Applies when the field is mandatory.
* Shown as an input field in the property panel.
* Default Value: You missed this. 

**3. Selected Value**
* The value that is captured by this form element, after the user has used it during form submission.
* Shown as a text string in the property panel.
* Default Value:(Blank).

**4. Disabled dates**
* Can be used to specify specific dates to disable or specific days to disable.
* Shown as a data feeder in the property panel. 
* To disable specific dates, mention the dates one by one. e.g. `18/11/2015 and 19/11/2015` (Takes input in dd/mm/yyyy format.)
* To disable specific days, mention the numbers specifying the days to be disabled, one by one. e.g. write `4 and 6` to disable Wednesdays and Fridays. (The notation assumes week starts on Sundays, with Sunday designated with number 1.)
* Default Value:(Blank).

**5. Start from**
* Specifies the date before which the calendar can't be used to pick a date.
* Shown as an input field in the property panel. Takes input in dd/mm/yyyy format.
* Possible range of values: (?)
* Default Value:(Blank).

**6. Show till**
* Specifies the date after which the calendar can't be used to pick a date.
* Shown as an input field in the property panel. Takes input in dd/mm/yyyy format.
* Possible range of values: (?)
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

**4. Date format**
* Specifies the format in which the date is displayed in the field.
* Shown as a dropdown in the property panel.
* Possible range of values: (?)
* Default value: 

**5. Context**
* Specifies the context in which the control is to be used. Accordingly the control takes on a relevant form.
* Shown as a pill button in the property panel.
* Possible values: 'Near Date', 'Far Date', 'Range'.
* Default value: 'Near Date'.

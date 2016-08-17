
`t-search-overlay` is an interstetial or a wait page. Ideally while loading a long list of results.
Theres a progress bar which runs with the value of timer. You can run the hide method to take the progress to 100 and hide the overlay.  
There are two contents,  you can pass .data and .footer
Example:
	<t-search-overlay>
		<div class="data">
			<t-flight-header hide-modal></t-flight-header>
		</div>
		<div class="footer">
			<img src="http://dev-capi.tavisca.com/NewUI/eva/Air/images/main-logo.png" alt="">
		</div>
	</t-search-overlay>
### Styling
  
  * {
    /* The background. */
    --app-header-bg, #0e5398

    /* Search overlay progress*/
    --search-overlay-progress:#5d9cec
  }

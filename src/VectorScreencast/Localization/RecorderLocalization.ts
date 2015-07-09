/// <reference path="../VectorScreencast" />

module VectorScreencast.Localization {
	
	/**
	 * A set of strings for localizating the recoreder UI
	 */
	export interface RecorderLocalization {
		/** Message that is displayed after all the data is uploaded to the server. */				
		UploadWasSuccessful: string,
		/**
		 * A message that is displayed after the upload has successfully finsihed and user can be redirected
		 * to the plage with the player. If he clicks the "OK" button, he will be redirected there.
		 */
		RedirectPrompt: string,
		/** Message that is displayed when upload fails. Recorded data is downloaded as a file if user clicks on the "OK" button. */
		FailureApology: string,		
		/** Message informing that user's browser doesn't support JavaScript or JavaScript is disabled. */
		NoJS: string,
		/** Loading message. */
		WaitingText: string,
		/** Default message that is displayed when the recorder processes some data. */
		Busy: string,
		/** Message that is showm when the opload is in progress. */
		UploadInProgress: string,
		/** Message that states that upload has failed. */
		UploadFailure: string,
				
		/** Recording/pause button group title */
		RecPause: string,
		/** Start recording button title */
		Record: string,
		/** Pause recording button title */
		Pause: string,
		/** Upload button title */
		Upload: string,
		/** Change color button title */
		ChangeColor: string,
		/** Change size button title */
		ChangeSize: string,
		/** Erase tool button title */
		Erase: string,
		/** Erase the whole canvas with current color button title */
		EraseAll: string,
		
		/** Audio recording panel title */
		AudioRecording: string,
		/** Audio recording is avalable */
		AudioRecordingAvailable: string,
		/** Audio recording is unavailable for some reason. */
		AudioRecordingUnavailable: string
	}
	
}
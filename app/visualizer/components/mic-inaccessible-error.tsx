function MicInaccessibleError() {
    return <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="container text-white text-center">
            <h1>Microphone is not accessible</h1>
            <p>Please ensure that microphone is accessible by your browser
                and you allow it to access. Rest assured, we will never send
                your audio data to anywhere, or even store it in your local browser.</p>
        </div>
    </div>
}

export default MicInaccessibleError;

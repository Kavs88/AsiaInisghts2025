
async function verify() {
    try {
        const res = await fetch('http://localhost:3002/test-refactor');
        if (!res.ok) {
            console.error('Request failed:', res.status, res.statusText);
            process.exit(1);
        }
        const text = await res.text();
        console.log('Response length:', text.length);
        if (text.includes('Refactor Verification')) {
            console.log('SUCCESS: Page loaded');
            if (text.includes('Count: 0')) {
                console.log('WARNING: Count is 0');
            } else {
                console.log('SUCCESS: Data found');
            }
        } else {
            console.log('FAILURE: Unexpected response content');
            console.log(text.substring(0, 200));
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
        process.exit(1);
    }
}

verify();

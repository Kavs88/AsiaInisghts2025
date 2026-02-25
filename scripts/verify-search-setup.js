
async function verify() {
    const BASE_URL = 'http://localhost:3002';
    console.log('Verifying setup on', BASE_URL);

    // 1. Check Page
    try {
        const res = await fetch(`${BASE_URL}/internal/ask`);
        if (res.status === 200) {
            const text = await res.text();
            if (text.includes('Founder Ask')) {
                console.log('SUCCESS: /internal/ask loaded.');
            } else {
                console.log('WARNING: /internal/ask loaded but content mismatch.');
            }
        } else {
            console.log(`FAILURE: /internal/ask returned ${res.status}`);
        }
    } catch (e) {
        console.log('FAILURE: Could not reach /internal/ask', e.message);
    }

    // 2. Check API Route
    try {
        const res = await fetch(`${BASE_URL}/api/embeddings`, {
            method: 'POST',
            body: JSON.stringify({ query: 'test' })
        });

        // We expect 503 (No Key) or 200 (Has Key). 404 means route missing.
        if (res.status === 404) {
            console.log('FAILURE: /api/embeddings returned 404 (Route not found). Server restart needed.');
        } else if (res.status === 503) {
            console.log('SUCCESS: /api/embeddings is active (Returned 503 as expected for missing key).');
        } else if (res.status === 200) {
            console.log('SUCCESS: /api/embeddings is working.');
        } else {
            console.log(`SUCCESS: /api/embeddings responsed with ${res.status} (Route exists).`);
        }
    } catch (e) {
        console.log('FAILURE: Could not reach /api/embeddings', e.message);
    }
}

verify();

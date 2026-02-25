
import { getBusinesses } from '@/lib/actions/businesses';

export default async function TestRefactorPage() {
    const businesses = await getBusinesses();

    return (
        <div>
            <h1>Refactor Verification</h1>
            <p>Count: {businesses.length}</p>
            <ul>
                {businesses.slice(0, 5).map(b => (
                    <li key={b.id}>{b.name} ({b.slug}) - Verified: {b.is_verified ? 'Yes' : 'No'}</li>
                ))}
            </ul>
        </div>
    );
}

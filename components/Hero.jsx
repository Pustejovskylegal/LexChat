'use client';

import { useState } from 'react';

export default function Hero() {
const [loading, setLoading] = useState(false);

async function startCheckout() {
try {
setLoading(true);

const res = await fetch('/api/create-checkout-session', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
email: 'test@test.cz', // zatím natvrdo (OK pro test)
userId: 'demo-user',
}),
});

const data = await res.json();

if (data.url) {
window.location.href = data.url;
} else {
alert('Chyba při vytváření platby.');
setLoading(false);
}
} catch (err) {
console.error(err);
alert('Něco se pokazilo.');
setLoading(false);
}
}

return (
<section className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
<div>
<h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
AI právní asistent pro rychlá, přesná a bezpečná řešení
</h1>

<p className="mt-4 text-lg text-gray-600 max-w-xl">
Automatizuji právní analýzu, přípravu dokumentů a poskytuji odpovědi v reálném čase.
</p>

<button
onClick={startCheckout}
disabled={loading}
className="btn-primary mt-8"
>
{loading ? 'Přesměrovávám…' : 'Mám zájem'}
</button>

<p className="mt-4 text-sm text-gray-500">
Po zaplacení budeš automaticky přesměrován do AI chatu.
</p>
</div>

<div className="card flex items-center justify-center">
<img
src="/mock-chat-screenshot.png"
alt="Ukázka AI chatu"
className="w-full h-auto rounded-xl"
/>
</div>
</section>
);
}

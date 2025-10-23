import { Helmet } from 'react-helmet-async';

const SimpleTestPage = () => {
    return (
        <>
            <Helmet>
                <title>Simple Test - Family Tracker</title>
            </Helmet>

            <div className="min-h-screen bg-red-500 p-8">
                <h1 className="text-4xl font-bold text-white mb-4">Simple Test</h1>
                <p className="text-white text-lg mb-4">If you see red background and white text, Tailwind is working!</p>

                <div className="bg-blue-500 p-4 rounded-lg mb-4">
                    <p className="text-white">Blue box with rounded corners</p>
                </div>

                <div className="bg-green-500 p-4 rounded-full mb-4">
                    <p className="text-white">Green circle</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-yellow-500 p-4 rounded">Yellow</div>
                    <div className="bg-purple-500 p-4 rounded">Purple</div>
                    <div className="bg-pink-500 p-4 rounded">Pink</div>
                </div>

                <div className="mt-8">
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                        Purple Button
                    </button>
                </div>
            </div>
        </>
    );
};

export default SimpleTestPage;

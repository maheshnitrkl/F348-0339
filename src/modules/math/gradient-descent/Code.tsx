import React from 'react';

export const GradientDescentCode: React.FC = () => {
    return (
        <div className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden font-mono text-sm relative h-full">
            <div className="absolute top-4 right-4 text-xs text-gray-500">gradient_descent.py</div>
            <div className="p-6 text-gray-300">
                <p className="mb-1"><span className="text-purple-400">def</span> <span className="text-yellow-200">gradient_descent</span>(theta, learning_rate, gradient):</p>
                <p className="ml-4 mb-1 text-gray-500"># Update weights in opposite direction of gradient</p>
                <p className="ml-4 mb-1">new_theta = theta - (learning_rate * gradient)</p>
                <p className="ml-4"><span className="text-purple-400">return</span> new_theta</p>
                <br />
                <p className="mb-1 text-gray-500"># Example usage</p>
                <p className="mb-1">lr = <span className="text-orange-400">0.01</span></p>
                <p>theta = <span className="text-blue-400">torch</span>.<span className="text-yellow-200">tensor</span>([<span className="text-orange-400">2.0</span>, <span className="text-orange-400">3.0</span>], requires_grad=<span className="text-blue-400">True</span>)</p>
            </div>
        </div>
    );
};

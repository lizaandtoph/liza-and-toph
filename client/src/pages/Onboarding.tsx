import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { logEvent } from '../analytics';
import { z } from 'zod';
import schemasData from '../data/schemas.json';

const childSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ageBand: z.enum(['newborn-2', '2-5', '5-8']),
});

const answersSchema = z.object({
  schemas: z.array(z.string()).min(0),
  barriers: z.array(z.string()).min(0),
  interests: z.array(z.string()).min(0),
});

export default function Onboarding() {
  const navigate = useNavigate();
  const { setChild, setAnswers } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    ageBand: '' as any,
    schemas: [] as string[],
    barriers: [] as string[],
    interests: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ageBands = [
    { value: 'newborn-2', label: 'Newborn - 2 years' },
    { value: '2-5', label: '2 - 5 years' },
    { value: '5-8', label: '5 - 8 years' },
  ];

  const barriers = [
    { value: 'access_to_toys', label: 'Hard to access toys' },
    { value: 'dumps_bins', label: 'Child dumps toy bins' },
    { value: 'space_constrained', label: 'Limited space' },
  ];

  const interests = [
    { value: 'building', label: 'Building' },
    { value: 'dolls', label: 'Dolls & Pretend Play' },
    { value: 'art', label: 'Art & Creativity' },
    { value: 'books', label: 'Books & Stories' },
    { value: 'gross_motor', label: 'Climbing & Movement' },
  ];

  const toggleArray = (arr: string[], value: string) => {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  };

  const nextStep = () => {
    if (step === 1) {
      try {
        childSchema.parse({ name: formData.name, ageBand: formData.ageBand });
        setErrors({});
        setStep(2);
      } catch (e) {
        if (e instanceof z.ZodError) {
          const newErrors: Record<string, string> = {};
          e.errors.forEach(err => {
            newErrors[err.path[0] as string] = err.message;
          });
          setErrors(newErrors);
        }
      }
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    try {
      const child = childSchema.parse({ name: formData.name, ageBand: formData.ageBand });
      const answers = answersSchema.parse({
        schemas: formData.schemas,
        barriers: formData.barriers,
        interests: formData.interests,
      });
      
      setChild(child);
      setAnswers(answers);
      logEvent('onboarding_completed', { ageBand: child.ageBand });
      navigate('/playboard');
    } catch (e) {
      console.error('Validation error:', e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`flex-1 h-2 rounded ${
                num <= step ? 'bg-olive' : 'bg-sand'
              } ${num !== 4 ? 'mr-2' : ''}`}
            />
          ))}
        </div>
        <p className="text-sm text-center">Step {step} of 4</p>
      </div>

      {step === 1 && (
        <div className="bg-[#EDE9DC] p-8 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Tell us about your child</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Child's Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-ivory border-2 border-sand rounded focus:border-ochre focus:outline-none"
              placeholder="Enter name"
            />
            {errors.name && <p className="text-burnt text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Age Band</label>
            <div className="space-y-2">
              {ageBands.map((band) => (
                <label key={band.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="ageBand"
                    value={band.value}
                    checked={formData.ageBand === band.value}
                    onChange={(e) => setFormData({ ...formData, ageBand: e.target.value })}
                    className="mr-3"
                  />
                  <span>{band.label}</span>
                </label>
              ))}
            </div>
            {errors.ageBand && <p className="text-burnt text-sm mt-1">{errors.ageBand}</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-[#EDE9DC] p-8 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Play Schemas</h2>
          <p className="mb-4 text-sm">Select any play patterns you've noticed:</p>
          <div className="space-y-3">
            {Object.entries(schemasData).map(([key, schema]) => (
              <label key={key} className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.schemas.includes(key)}
                  onChange={() => setFormData({
                    ...formData,
                    schemas: toggleArray(formData.schemas, key)
                  })}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">{schema.label}</div>
                  <div className="text-sm text-espresso/70">{schema.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-[#EDE9DC] p-8 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Current Barriers</h2>
          <p className="mb-4 text-sm">Any challenges with play at home?</p>
          <div className="space-y-3">
            {barriers.map((barrier) => (
              <label key={barrier.value} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.barriers.includes(barrier.value)}
                  onChange={() => setFormData({
                    ...formData,
                    barriers: toggleArray(formData.barriers, barrier.value)
                  })}
                  className="mr-3"
                />
                <span>{barrier.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-[#EDE9DC] p-8 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Interests</h2>
          <p className="mb-4 text-sm">What does your child enjoy?</p>
          <div className="space-y-3">
            {interests.map((interest) => (
              <label key={interest.value} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest.value)}
                  onChange={() => setFormData({
                    ...formData,
                    interests: toggleArray(formData.interests, interest.value)
                  })}
                  className="mr-3"
                />
                <span>{interest.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="px-6 py-2 border-2 border-olive text-olive rounded hover:bg-olive hover:text-ivory transition"
          >
            Back
          </button>
        )}
        <div className={step === 1 ? 'ml-auto' : ''}>
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-olive text-ivory rounded hover:bg-ochre transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-olive text-ivory rounded hover:bg-ochre transition"
            >
              See My Play Board
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={23} />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

      <p className="text-sm leading-7 text-gray-600">{description}</p>
    </div>
  );
}
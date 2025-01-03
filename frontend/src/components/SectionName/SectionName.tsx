import './SectionName.scss';

const SectionName = ({ title }: { title: string }) => {
  return (
    <div className="section-title-container flex align-center flex-gap">
      <div className="title-bar"></div>
      <div className="section-title">{title}</div>
    </div>
  );
};

export default SectionName;

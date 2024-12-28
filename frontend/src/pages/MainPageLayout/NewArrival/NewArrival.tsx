const NewArrival = () => {
  return (
    <div className="new-arrival">
      <div className="flex justify-between align-end">
        <div className="flex align-end">
          <div className="section-info-container">
            <div className="section-title-container flex align-center flex-gap">
              <div className="title-bar"></div>
              <div className="section-title">Featured</div>
            </div>
            <div className="flash-sales-title">New Arrival</div>
          </div>
        </div>
      </div>
      <div className="new-arrival-layout grid grid-gap-2">
        <div className="new-arrival-item item1">1</div>
        <div className="new-arrival-item item2">2</div>
        <div className="new-arrival-item item3">3</div>
        <div className="new-arrival-item item4">4</div>
      </div>
    </div>
  );
};

export default NewArrival;

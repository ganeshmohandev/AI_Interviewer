import React from 'react'

function page() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', minHeight: '100vh', height: '100vh', margin: '40px' }}>
      {/* First row with two columns */}
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', textAlign: 'center' }}>Column 1 Content</div>
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', textAlign: 'center' }}>Column 2 Content</div>
      </div>
      {/* Second row with merged columns */}
      <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Merged Column Content
      </div>
    </div>
  )
}

export default page
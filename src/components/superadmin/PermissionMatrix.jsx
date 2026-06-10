import React from "react";

const permissions = ["View", "Create", "Edit", "Delete"];

function PermissionMatrix({ roles = [] }) {
  return (
    <div className="sa-permission-matrix">
      <div className="sa-permission-head">
        <span>Role</span>
        {permissions.map((permission) => (
          <span key={permission}>{permission}</span>
        ))}
      </div>

      {roles.map((role) => (
        <div className="sa-permission-row" key={role.id}>
          <b>{role.name}</b>
          {permissions.map((permission) => (
            <label key={permission} className="sa-checkbox">
              <input
                type="checkbox"
                checked={role.permissions.includes(permission)}
                readOnly
              />
              <span>{permission}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

export default PermissionMatrix;


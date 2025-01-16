// components/editor/EditableBlock.tsx
"use client";

import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useRef } from "react";
import { ItemTypes } from "@/constants/dndTypes";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Data interface for each résumé block. */
export interface EditableBlockData {
  id: string;
  sectionName: string;

  /* Common fields */
  title: string;
  location?: string;
  duration?: string;

  /* Header-specific */
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;

  /* Education-specific */
  degree?: string;
  relevantCourses?: string;
  activities?: string;

  /* Skills-specific */
  languages?: string;
  other?: string;

  /* Experience-specific */
  bullets?: string[]; // bullet points
  role?: string; // e.g., "Software Engineer Intern"

  /* Projects-specific */
  projectName?: string; // e.g., "Portfolio Website"
  technologies?: string;
  projectBullets?: string[];
}

interface EditableBlockProps {
  block: EditableBlockData;
  onUpdate: (id: string, updated: Partial<EditableBlockData>) => void;
  onDelete?: (id: string) => void;
  moveBlock: (draggedId: string, hoveredId: string) => void;
}

export function EditableBlock({
  block,
  onUpdate,
  onDelete,
  moveBlock,
}: EditableBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Setup drag
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: { id: block.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Setup drop
  const [, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    hover(item: { id: string }, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }

      const draggedId = item.id;
      const hoveredId = block.id;

      if (draggedId === hoveredId) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item's height
      if (hoverClientY < hoverMiddleY) {
        moveBlock(draggedId, hoveredId);
      }
    },
  });

  // Connect drag and drop
  drag(drop(ref));

  // Adjust opacity when dragging
  const opacity = isDragging ? 0.5 : 1;

  // Generic helper to update any single field.
  const handleFieldChange = (
    field: keyof EditableBlockData,
    value: string | string[]
  ) => {
    onUpdate(block.id, { [field]: value });
  };

  // ========== EXPERIENCE bullet points ==========
  const handleAddExpBullet = () => {
    const newBullets = [...(block.bullets || []), ""];
    handleFieldChange("bullets", newBullets);
  };

  const handleRemoveExpBullet = (index: number) => {
    const newBullets = [...(block.bullets || [])];
    newBullets.splice(index, 1);
    handleFieldChange("bullets", newBullets);
  };

  const handleExpBulletChange = (index: number, value: string) => {
    const newBullets = [...(block.bullets || [])];
    newBullets[index] = value;
    handleFieldChange("bullets", newBullets);
  };

  // ========== PROJECTS bullet points ==========
  const handleAddProjectBullet = () => {
    const newBullets = [...(block.projectBullets || []), ""];
    handleFieldChange("projectBullets", newBullets);
  };

  const handleRemoveProjectBullet = (index: number) => {
    const newBullets = [...(block.projectBullets || [])];
    newBullets.splice(index, 1);
    handleFieldChange("projectBullets", newBullets);
  };

  const handleProjectBulletChange = (index: number, value: string) => {
    const newBullets = [...(block.projectBullets || [])];
    newBullets[index] = value;
    handleFieldChange("projectBullets", newBullets);
  };

  // Decide what fields to render based on `sectionName`.
  const renderFields = () => {
    switch (block.sectionName.toLowerCase()) {
      // ------------------------------
      // HEADER
      // ------------------------------
      case "header":
        return (
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Full Name</div>
              <Input
                placeholder="e.g., John Doe"
                value={block.title || ""}
                onChange={(e) =>
                  handleFieldChange("title", e.target.value)
                }
              />
            </div>
            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Phone</div>
                <Input
                  placeholder="e.g., (123) 456-7890"
                  value={block.phone || ""}
                  onChange={(e) =>
                    handleFieldChange("phone", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Email</div>
                <Input
                  placeholder="e.g., john.doe@example.com"
                  value={block.email || ""}
                  onChange={(e) =>
                    handleFieldChange("email", e.target.value)
                  }
                />
              </div>
            </div>
            {/* GitHub + LinkedIn */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">GitHub</div>
                <Input
                  placeholder="e.g., github.com/johndoe"
                  value={block.github || ""}
                  onChange={(e) =>
                    handleFieldChange("github", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">LinkedIn</div>
                <Input
                  placeholder="e.g., linkedin.com/in/johndoe"
                  value={block.linkedin || ""}
                  onChange={(e) =>
                    handleFieldChange("linkedin", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      // ------------------------------
      // EDUCATION
      // ------------------------------
      case "education":
        return (
          <div className="space-y-4">
            {/* School Name */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Institution Name</div>
              <Input
                placeholder="e.g., University of Maryland"
                value={block.title || ""}
                onChange={(e) =>
                  handleFieldChange("title", e.target.value)
                }
              />
            </div>
            {/* Location + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Location</div>
                <Input
                  placeholder="e.g., College Park, MD"
                  value={block.location || ""}
                  onChange={(e) =>
                    handleFieldChange("location", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Duration</div>
                <Input
                  placeholder="e.g., Aug 2021 - May 2025"
                  value={block.duration || ""}
                  onChange={(e) =>
                    handleFieldChange("duration", e.target.value)
                  }
                />
              </div>
            </div>
            {/* Degree */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Degree</div>
              <Input
                placeholder="e.g., Bachelor of Science in Computer Science"
                value={block.degree || ""}
                onChange={(e) =>
                  handleFieldChange("degree", e.target.value)
                }
              />
            </div>
            {/* Relevant Courses */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Relevant Courses</div>
              <Textarea
                placeholder="e.g., Algorithms, Database Design, Machine Learning"
                value={block.relevantCourses || ""}
                onChange={(e) =>
                  handleFieldChange("relevantCourses", e.target.value)
                }
              />
            </div>
            {/* Activities */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Activities</div>
              <Textarea
                placeholder="e.g., Robotics Club (President), Hackathon Team Lead"
                value={block.activities || ""}
                onChange={(e) =>
                  handleFieldChange("activities", e.target.value)
                }
              />
            </div>
          </div>
        );

      // ------------------------------
      // TECHNICAL SKILLS
      // ------------------------------
      case "technical skills":
        return (
          <div className="space-y-4">
            {/* Languages */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Languages</div>
              <Textarea
                placeholder="e.g., Java, Python, JavaScript, C++"
                value={block.languages || ""}
                onChange={(e) =>
                  handleFieldChange("languages", e.target.value)
                }
              />
            </div>
            {/* Other Tools */}
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Other Technologies & Tools
              </div>
              <Textarea
                placeholder="e.g., Git, Docker, AWS, React"
                value={block.other || ""}
                onChange={(e) =>
                  handleFieldChange("other", e.target.value)
                }
              />
            </div>
          </div>
        );

      // ------------------------------
      // EXPERIENCE
      // ------------------------------
      case "experience": {
        // "title" = company name, "role" = job title, "bullets" = bullet points
        return (
          <div className="space-y-4">
            {/* Company Name */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Company/Organization</div>
              <Input
                placeholder="e.g., Amazon Web Services"
                value={block.title || ""}
                onChange={(e) =>
                  handleFieldChange("title", e.target.value)
                }
              />
            </div>
            {/* Location + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Location</div>
                <Input
                  placeholder="e.g., Arlington, VA"
                  value={block.location || ""}
                  onChange={(e) =>
                    handleFieldChange("location", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Duration</div>
                <Input
                  placeholder="e.g., May 2023 - Aug 2023"
                  value={block.duration || ""}
                  onChange={(e) =>
                    handleFieldChange("duration", e.target.value)
                  }
                />
              </div>
            </div>
            {/* Role (optional) */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Role/Title</div>
              <Input
                placeholder="e.g., Software Engineer Intern"
                value={block.role || ""}
                onChange={(e) =>
                  handleFieldChange("role", e.target.value)
                }
              />
            </div>

            {/* Bullet Points */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Bullet Points</div>
              {(block.bullets || []).map((bullet, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder={`Bullet #${index + 1}`}
                    value={bullet}
                    onChange={(e) =>
                      handleExpBulletChange(index, e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveExpBullet(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddExpBullet}>
                + Add Bullet
              </Button>
            </div>
          </div>
        );
      }

      // ------------------------------
      // PROJECTS
      // ------------------------------
      case "projects": {
        // "projectName" = name, "technologies" = stack, "projectBullets" = bullet points
        return (
          <div className="space-y-4">
            {/* Project Name */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Project Name</div>
              <Input
                placeholder="e.g., Portfolio Website"
                value={block.projectName || ""}
                onChange={(e) =>
                  handleFieldChange("projectName", e.target.value)
                }
              />
            </div>
            {/* Technologies + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Technologies</div>
                <Input
                  placeholder="e.g., React, Node.js, MongoDB"
                  value={block.technologies || ""}
                  onChange={(e) =>
                    handleFieldChange("technologies", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Duration</div>
                <Input
                  placeholder="e.g., June 2023 - Present"
                  value={block.duration || ""}
                  onChange={(e) =>
                    handleFieldChange("duration", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Bullet Points for Projects */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Bullet Points</div>
              {(block.projectBullets || []).map((bullet, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder={`Bullet #${index + 1}`}
                    value={bullet}
                    onChange={(e) =>
                      handleProjectBulletChange(index, e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveProjectBullet(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddProjectBullet}>
                + Add Bullet
              </Button>
            </div>
          </div>
        );
      }

      default:
        // Catch-all for unhandled sections
        return null;
    }
  };

  return (
    <Card
      ref={ref}
      className="relative opacity-100"
      style={{ opacity }}
    >
      <CardContent className="pt-6">
        {/* Optional delete button in top-right corner */}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <div className="text-sm font-medium text-gray-500 mb-4">
          {block.sectionName} Section
        </div>
        {renderFields()}
      </CardContent>
    </Card>
  );
}

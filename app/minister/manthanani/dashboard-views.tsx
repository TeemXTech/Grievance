// Dashboard Views Component - Part 2 of the enhanced dashboard

          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-blue-500" onClick={() => setActiveView("projects")}>
                  <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Projects</p>
                        <p className="text-3xl font-bold text-blue-600">{dashboardData.summary?.totalProjects || mockData.summary.totalProjects}</p>
                      </div>
                      <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-green-500" onClick={() => setActiveView("grievances")}>
                  <CardContent className="p-6 bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Grievances</p>
                        <p className="text-3xl font-bold text-green-600">{dashboardData.summary?.totalGrievances || mockData.summary.totalGrievances}</p>
                      </div>
                      <FileText className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-orange-500">
                  <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                        <p className="text-3xl font-bold text-orange-600">{dashboardData.summary?.pendingActions || mockData.summary.pendingActions}</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-purple-500" onClick={() => setActiveView("schedule")}>
                  <CardContent className="p-4 bg-gradient-to-br from-purple-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                        <p className="text-2xl font-bold text-purple-600">{events.length || mockData.summary.upcomingEvents}</p>
                      </div>
                      <CalendarIcon className="w-6 h-6 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-red-500 bg-red-50">
                  <CardContent className="p-4 bg-gradient-to-br from-red-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Critical Issues</p>
                        <p className="text-2xl font-bold text-red-700">{dashboardData.summary?.criticalIssues || mockData.summary.criticalIssues}</p>
                      </div>
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Calendar & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5" />
                      <span>Today's Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(events.length > 0 ? events : mockData.calendarEvents).filter(event => event.date === "2024-01-15").map((event) => (
                        <div key={event.id} className={`p-3 rounded-lg ${event.color} bg-opacity-10 border-l-4 ${event.color.replace('bg-', 'border-')}`}>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            {event.delegatedTo && (
                              <Badge variant="outline" className="text-xs">Delegated</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{event.time} - {event.endTime}</p>
                          <p className="text-xs text-gray-500">{event.place}</p>
                          {event.canDelegate && !event.delegatedTo && (
                            <Button size="sm" variant="outline" className="mt-2 text-xs h-6"
                                    onClick={() => { setSelectedEvent(event); setShowDelegationModal(true); }}>
                              Delegate
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Quick Actions & Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-600">Urgent Actions</h4>
                        <div className="space-y-1">
                          <div className="text-sm p-2 bg-red-50 rounded border-l-2 border-red-500">
                            {mockData.summary.unassignedGrievances} Unassigned Grievances
                          </div>
                          <div className="text-sm p-2 bg-orange-50 rounded border-l-2 border-orange-500">
                            {mockData.summary.overdueProjects} Overdue Projects
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-600">This Week</h4>
                        <div className="space-y-1">
                          <div className="text-sm p-2 bg-blue-50 rounded">
                            3 Project Inspections
                          </div>
                          <div className="text-sm p-2 bg-green-50 rounded">
                            2 Public Meetings
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Map & Places */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Constituency Map</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden border-2 border-green-200">
                      {/* Telangana State Outline */}
                      <div className="absolute inset-0">
                        <div className="absolute top-4 left-4 text-xs font-bold text-green-800">TELANGANA STATE</div>
                        <div className="absolute top-8 left-4 text-xs text-green-600">Peddapalli District</div>
                        <div className="absolute bottom-4 right-4 text-xs text-blue-600">Manthanani Constituency</div>
                      </div>
                      
                      {/* Enhanced Place Markers */}
                      {(places.length > 0 ? places : mockData.places).map((place, index) => {
                        const hasIssues = mockData.grievances.filter(g => g.place === place.name && g.status === 'Open').length > 0
                        const hasProjects = mockData.projects.filter(p => p.place === place.name).length > 0
                        return (
                          <div
                            key={place.id}
                            className={`absolute w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-125 flex items-center justify-center text-white text-xs font-bold ${
                              hasIssues ? 'bg-red-500 animate-pulse' : hasProjects ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{
                              left: `${15 + (index * 12)}%`,
                              top: `${25 + (index * 8)}%`
                            }}
                            onClick={() => setSelectedPlace(place)}
                            title={`${place.name} - ${place.projects} projects, ${place.grievances} grievances`}
                          >
                            {place.grievances}
                          </div>
                        )
                      })}
                      
                      {/* Legend */}
                      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs">
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Issues</span>
                        </div>
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Projects</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Normal</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Places Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-auto">
                      {(places.length > 0 ? places : mockData.places).map((place) => (
                        <div
                          key={place.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedPlace(place)}
                        >
                          <div>
                            <p className="font-medium">{place.name}</p>
                            <p className="text-sm text-gray-600">
                              {place.projects} projects, {place.grievances} grievances
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockData.categories.map((category) => (
                      <div key={category.name} className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <category.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-medium">{category.name}</h3>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">{category.projects} Projects</p>
                          <p className="text-sm text-gray-600">{category.grievances} Grievances</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(projects.length > 0 ? projects : mockData.projects).slice(0, 3).map((project) => (
                        <div key={project.id} className="border-l-4 border-blue-500 pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded"
                             onClick={() => setSelectedProject(project)}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{project.name}</h4>
                            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{project.place} • {project.budget}</p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Officer: {project.assignedOfficer}</span>
                            <span className="text-xs text-gray-500">{project.daysInProgress || project.daysCompleted} days</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={project.progress} className="flex-1" />
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Grievances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(grievances.length > 0 ? grievances : mockData.grievances).slice(0, 3).map((grievance) => (
                        <div key={grievance.id} className="border-l-4 border-red-500 pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded"
                             onClick={() => setSelectedGrievance(grievance)}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{grievance.title}</h4>
                            <div className="flex space-x-1">
                              <Badge className={getPriorityColor(grievance.priority)} variant="outline">{grievance.priority}</Badge>
                              <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{grievance.referenceNumber}</p>
                          <p className="text-xs text-gray-600 mb-1">By: {grievance.requesterName} from {grievance.place}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Officer: {grievance.assignedFieldOfficer}</span>
                            <span className="text-xs text-gray-500">{grievance.daysOpen || grievance.daysInProgress || grievance.daysToResolve} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}